# minch-site

Marketing landing page for [Minch](https://github.com/anandghegde/minch), a free macOS client
for TorBox. Built with [Astro](https://astro.build) + Tailwind and served as
static files from a Linode VPS.

## Local development

```bash
nvm use            # picks up .nvmrc (Node 20)
npm install
npm run dev        # http://localhost:4321
```

## Build & verify

```bash
npm run build      # writes dist/ (incl. sitemap-index.xml)
npm run check      # astro check (template + type errors)
npx serve dist     # preview the built site
```

## Analytics & environment

Privacy-first, cookieless analytics via self-hosted [Umami](https://umami.is):
no GA, no cookies, honors Do-Not-Track. All IDs / hosts / URLs live in one
place — `src/config.ts` — fed by `PUBLIC_` env vars:

```bash
cp .env.example .env          # then set PUBLIC_UMAMI_WEBSITE_ID + host
```

The tracking snippet is injected **only in production builds** and only when a
website ID is set, so `astro dev` stays tracker-free. Server-side setup (Umami
container, `analytics.minch.app` vhost, the `/download` redirect, search-engine
verification) is the one-time runbook in [`docs/analytics-setup.md`](docs/analytics-setup.md).

The OG card image and app icons are generated from brand tokens:

```bash
node scripts/generate-og.mjs      # writes public/og-image.png (1200×630)
node scripts/generate-icons.mjs   # writes public/apple-touch-icon.png (180×180)
```


## Deploy (Linode)

The deploy script builds the site and rsyncs `dist/` to the Linode box.

```bash
export MINCH_DEPLOY_USER=deploy
export MINCH_DEPLOY_HOST=minch.app          # or the box's IP
export MINCH_DEPLOY_PATH=/var/www/minch.app

npm run deploy -- --dry-run                 # preview the rsync
npm run deploy                              # actually upload
```

## One-time Linode setup

Install nginx and Certbot on the box, then drop this site block in
`/etc/nginx/sites-available/minch.app` and symlink it into
`sites-enabled/`:

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name minch.app www.minch.app;

  root /var/www/minch.app;
  index index.html;

  # Long cache for fingerprinted Astro bundle, short cache for HTML.
  location /_astro/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  location / {
    try_files $uri $uri/ $uri.html =404;
    add_header Cache-Control "public, max-age=300";
  }

  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

Then enable HTTPS once DNS resolves:

```bash
sudo certbot --nginx -d minch.app -d www.minch.app
```

Certbot will rewrite the server block to redirect 80→443 automatically.

## Repo layout

```
src/
├── components/    # Wordmark, Hero, ScreenshotFrame, HowItWorks, Feature(s),
│                  #   CommandPalette, PrivacyNote, Faq, Footer
├── config.ts      # single source of truth: IDs, hosts, URLs, event names
├── lib/           # github.ts — build-time .dmg download count (fails gracefully)
├── layouts/       # Base (html, meta, OG, JSON-LD, Umami, slot)
├── pages/         # index.astro — composes everything
└── styles/        # global.css (Tailwind + custom)
public/            # static assets — favicon, robots, og-image, apple-touch-icon
scripts/           # deploy.sh, generate-og.mjs, generate-icons.mjs
docs/              # analytics-setup.md — one-time Linode/ops runbook
```

## Brand tokens

Mirror the Swift app's `Theme.swift`. If a color changes in
`Packages/MinchUI/Sources/MinchUI/Theme.swift`, update
`tailwind.config.mjs` to match.

| Token              | Hex       |
|--------------------|-----------|
| `bolt`             | `#3D7BFF` |
| `aqua`             | `#5BE2F7` |
| `surface.primary`  | `#121212` |
| `surface.elevated` | `#191919` |

> `aqua` mirrors the app's `Color.minchCurrent`. It's deliberately **not**
> named `current` in Tailwind — that would shadow Tailwind's built-in
> `currentColor` keyword (`text-current`, `stroke-current`, …).

## TODO before launch

- [x] Library screenshot (`public/screenshots/library.png`) is a **sanitized**
      real capture — email masked, transfer titles swapped for Linux ISOs /
      Blender open movies (see `public/screenshots/README.md`).
- [x] Generate `public/og-image.png` (1200×630) — `node scripts/generate-og.mjs`
- [x] Point the Hero "Download for macOS" CTA at first-party `/download`
      (nginx 302 → GitHub Releases `.dmg`; see `docs/analytics-setup.md`)
- [x] Centralize the real repo URL (`Hero`, `Faq`, `Footer`) in `src/config.ts`
- [ ] Register `minch.app` and point its A record at the Linode IP
- [ ] Run the analytics/ops runbook (`docs/analytics-setup.md`) and set
      `PUBLIC_UMAMI_WEBSITE_ID` in `.env`
