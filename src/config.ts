/**
 * Centralized site configuration.
 *
 * Single source of truth for every ID / host / outbound URL used across the
 * site. Never hardcode these in components — import from here so there is one
 * place to bump on a new release or infra change.
 *
 * Secrets are NOT required: the only env-driven values are PUBLIC_ analytics
 * settings, which are safe to expose in client markup. Override them via `.env`
 * (see `.env.example`) without touching code.
 */

/** Canonical production origin. Mirrors `site` in astro.config.mjs. */
export const SITE_URL = 'https://minch.app';

// ── GitHub ──────────────────────────────────────────────────────────────────

/** GitHub repo that hosts the Minch app + its release `.dmg` assets. */
export const GITHUB_OWNER = 'anandghegde';
export const GITHUB_REPO = 'minch';
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;

// ── Downloads ───────────────────────────────────────────────────────────────

/**
 * First-party download path. nginx 302-redirects this to the current GitHub
 * Releases `.dmg` (see docs/analytics-setup.md). Linking the site here (instead
 * of straight to GitHub) means downloads show up in nginx logs *and* Umami, and
 * a new build can be pointed to without redeploying the site.
 */
export const DOWNLOAD_PATH = '/download';

/**
 * Direct GitHub Releases `.dmg` URL. This is the nginx redirect *target* (ops
 * runbook) and a build-time fallback — the site itself links to DOWNLOAD_PATH.
 * Bump this (and the nginx redirect) when cutting a new release.
 */
export const DMG_URL = `${GITHUB_REPO_URL}/releases/download/v1.0.0/Minch.dmg`;

// ── Analytics (self-hosted Umami) ───────────────────────────────────────────
//
// Umami is cookieless by default, stores no PII, and — with
// `data-do-not-track="true"` on the snippet — honors the browser's DNT signal.
// No consent banner is required. The script is only injected in production
// builds (see Base.astro).

/** Host of the self-hosted Umami instance. */
export const ANALYTICS_HOST =
  import.meta.env.PUBLIC_ANALYTICS_HOST ?? 'https://analytics.minch.app';

/** Umami website ID. Copied from the Umami dashboard into `.env`. */
export const UMAMI_WEBSITE_ID = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID ?? '';

/** Umami tracking script URL. */
export const UMAMI_SRC = `${ANALYTICS_HOST}/script.js`;

/**
 * Umami custom event names. Added to anchors via `data-umami-event="…"`; Umami
 * reads the attribute on click — no JS required. Keep names distinct per CTA so
 * the funnel is legible in the dashboard.
 */
export const EVENTS = {
  downloadMacos: 'download-macos',
  viewGithubHero: 'view-github-hero',
  viewGithubFooter: 'view-github-footer',
  viewGithubFaq: 'view-github-faq',
} as const;

// ── Search engine verification (optional) ───────────────────────────────────
//
// DNS TXT verification is preferred (keeps markup clean — see runbook). These
// are an opt-in fallback: a <meta> tag renders only when the value is set.

export const GOOGLE_SITE_VERIFICATION =
  import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? '';
export const BING_SITE_VERIFICATION =
  import.meta.env.PUBLIC_BING_SITE_VERIFICATION ?? '';
