# Analytics & SEO ops runbook

One-time setup on the Linode box for privacy-first analytics (self-hosted
[Umami](https://umami.is)), the first-party `/download` redirect, and
search-engine verification. The repo-side wiring (tracking snippet, `/download`
links, sitemap, JSON-LD, OG image) is already done — see `src/config.ts`.

Everything below runs **once** per box. After it's done, the only recurring task
is bumping the `.dmg` URL on a new release (one nginx line).

**Prereqs:** Docker + Docker Compose, nginx, and certbot already on the box (the
static site setup in the main `README.md`). DNS for `minch.app` points at the
Linode IP; add an `analytics.minch.app` A/AAAA record too.

---

## 1. Run Umami (Docker Compose, localhost-only)

Umami + Postgres, bound to `127.0.0.1` so nothing is exposed publicly — nginx
terminates TLS and reverse-proxies in (step 2).

```bash
sudo mkdir -p /opt/umami && cd /opt/umami
```

Create `/opt/umami/docker-compose.yml`:

```yaml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"        # localhost only; nginx proxies to this
    environment:
      DATABASE_URL: postgresql://umami:${UMAMI_DB_PASSWORD}@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET}
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: ${UMAMI_DB_PASSWORD}
    volumes:
      - umami-db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U umami -d umami"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  umami-db:
```

Create `/opt/umami/.env` (secrets — `chmod 600`, never commit):

```bash
umask 077
cat > /opt/umami/.env <<EOF
UMAMI_DB_PASSWORD=$(openssl rand -hex 24)
UMAMI_APP_SECRET=$(openssl rand -hex 32)
EOF
```

Start it:

```bash
cd /opt/umami
docker compose up -d
docker compose logs -f umami      # wait for "Listening on port 3000"
curl -fsS http://127.0.0.1:3000/api/heartbeat && echo " umami up"
```

---

## 2. nginx vhost for `analytics.minch.app` + TLS

Create `/etc/nginx/sites-available/analytics.minch.app`:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name analytics.minch.app;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Enable + TLS:

```bash
sudo ln -s /etc/nginx/sites-available/analytics.minch.app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d analytics.minch.app          # rewrites to 443 + auto-renew
```

Verify the tracking script is reachable (this is the `UMAMI_SRC` the site loads):

```bash
curl -fsSI https://analytics.minch.app/script.js | head -n1   # expect 200
```

---

## 3. First-party `/download` redirect (the high-leverage piece)

Makes downloads first-party: they land in nginx logs **and** Umami, and a new
`.dmg` is a one-line change here — no site redeploy. Add an **exact-match**
location to the existing `minch.app` server block in
`/etc/nginx/sites-available/minch.app` (exact match wins regardless of order):

```nginx
  # First-party download redirect. 302 (not 301) so it's never permanently
  # cached — bump the target URL on each new release; that's the only edit.
  location = /download {
    return 302 https://github.com/anandghegde/minch/releases/download/v1.0.0/Minch.dmg;
  }
```

Reload and verify it 302s to the `.dmg`:

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -sSI https://minch.app/download | grep -i -E 'HTTP/|location'
# expect: HTTP/2 302  +  location: https://github.com/.../Minch.dmg
```

> Keep this URL in sync with `DMG_URL` in `src/config.ts` (used for JSON-LD /
> docs). On a new release, update **both** lines.

---

## 4. Configure Umami: website + event + repo wiring

1. Open `https://analytics.minch.app`, log in with the default
   **`admin` / `umami`**, then immediately change the password
   (Settings → Profile).
2. **Settings → Websites → Add website**: Name `Minch`, Domain `minch.app`.
3. Open the new website → **Edit** → copy the **Website ID** (a UUID).
4. Put it in the repo's `.env` (copy from `.env.example`) and redeploy:

   ```bash
   # in the minch-site repo
   cp -n .env.example .env
   # set:
   #   PUBLIC_UMAMI_WEBSITE_ID=<the-uuid>
   #   PUBLIC_ANALYTICS_HOST=https://analytics.minch.app
   npm run deploy
   ```

   The snippet only renders in **production** builds and only when
   `PUBLIC_UMAMI_WEBSITE_ID` is set (see `src/layouts/Base.astro`).

5. **Events:** no setup needed. The download button carries
   `data-umami-event="download-macos"` (see `EVENTS` in `src/config.ts`); Umami
   records it automatically on click. View it under the website's **Events** tab,
   or add it as a **Goal** (Reports → Goals) to chart the download funnel.
   Other CTAs report `view-github-hero` / `view-github-footer` / `view-github-faq`.

### Verify end-to-end

- Load `https://minch.app` (with DNT off) → a pageview appears in Umami.
- With DNT **on**, no event is sent (snippet has `data-do-not-track="true"`).
- Click **Download for macOS** → browser 302s to the `.dmg` **and** a
  `download-macos` event shows in Umami.
- DevTools → Application → Cookies: **none** set by analytics.

---

## 5. Back up the Umami Postgres volume

Logical dump (simple, restorable anywhere). Add to root's crontab:

```bash
sudo mkdir -p /var/backups/umami
sudo crontab -e
```

```cron
# Nightly Umami DB dump at 03:30, keep 14 days
30 3 * * * cd /opt/umami && /usr/bin/docker compose exec -T db pg_dump -U umami umami | gzip > /var/backups/umami/umami-$(date +\%F).sql.gz && find /var/backups/umami -name 'umami-*.sql.gz' -mtime +14 -delete
```

Restore:

```bash
gunzip -c /var/backups/umami/umami-YYYY-MM-DD.sql.gz \
  | docker compose -f /opt/umami/docker-compose.yml exec -T db psql -U umami -d umami
```

> The named volume `umami-db` persists across `docker compose up/down`. Only
> `docker compose down -v` destroys it — don't. For off-box safety, copy
> `/var/backups/umami/*.sql.gz` to object storage.

---

## 6. Search Console + Bing verification + sitemap

`@astrojs/sitemap` emits `dist/sitemap-index.xml` on build (referenced by
`public/robots.txt`). Verify ownership via **DNS TXT** (preferred — keeps markup
clean) rather than meta tags.

**Google Search Console** (https://search.google.com/search-console):
1. Add a **Domain** property for `minch.app`.
2. Add the provided `google-site-verification=…` **TXT** record at your DNS host;
   confirm in GSC.
3. **Sitemaps** → submit `https://minch.app/sitemap-index.xml`.

**Bing Webmaster Tools** (https://www.bing.com/webmasters):
1. **Import from Google Search Console** (one click), or add the Bing DNS
   **TXT/CNAME** record it provides.
2. Submit the same sitemap URL.

> Fallback only — if you can't edit DNS: set `PUBLIC_GOOGLE_SITE_VERIFICATION`
> / `PUBLIC_BING_SITE_VERIFICATION` in `.env` and redeploy to emit verification
> `<meta>` tags from `Base.astro` instead.

**Rich results / cards (post-deploy):**
- JSON-LD `SoftwareApplication`: https://search.google.com/test/rich-results
- OG/Twitter card: https://cards-dev.twitter.com/validator and
  https://www.opengraph.xyz — confirm `https://minch.app/og-image.png` renders.

---

## Recurring task (new release)

1. Update the `.dmg` URL in nginx `location = /download` (step 3) and
   `DMG_URL` in `src/config.ts`; `sudo systemctl reload nginx`.
2. GitHub's per-asset `download_count` remains the ground-truth total; the site
   surfaces it automatically at build time (`src/lib/github.ts`).
