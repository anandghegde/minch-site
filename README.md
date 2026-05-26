# minch-site

Marketing landing page for [Minch](https://github.com/), a free macOS client
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
npm run build      # writes dist/
npm run check      # astro check (template + type errors)
npx serve dist     # preview the built site
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
├── components/    # Wordmark, Hero, Feature, Features, ScreenshotFrame, Faq, Footer
├── layouts/       # Base (html, meta, OG, slot)
├── pages/         # index.astro — composes everything
└── styles/        # global.css (Tailwind + custom)
public/            # static assets — favicon, robots, screenshots, og-image
scripts/deploy.sh  # build + rsync to Linode
```

## Brand tokens

Mirror the Swift app's `Theme.swift`. If a color changes in
`Packages/MinchUI/Sources/MinchUI/Theme.swift`, update
`tailwind.config.mjs` to match.

| Token              | Hex       |
|--------------------|-----------|
| `bolt`             | `#3D7BFF` |
| `current`          | `#5BE2F7` |
| `surface.primary`  | `#121212` |
| `surface.elevated` | `#191919` |

## TODO before launch

- [ ] Capture a real Library screenshot into `public/screenshots/library.png`
- [ ] Generate `public/og-image.png` (1200×630)
- [ ] Swap the Hero "Download for macOS" anchor for the GitHub Releases
      latest `.dmg` URL
- [ ] Replace the placeholder `https://github.com/` links in `Hero`, `Faq`,
      `Footer` with the real repo URL
- [ ] Register `minch.app` and point its A record at the Linode IP
