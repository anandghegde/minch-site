/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Self-hosted Umami host, e.g. https://analytics.minch.app */
  readonly PUBLIC_ANALYTICS_HOST?: string;
  /** Umami website ID (from the Umami dashboard). */
  readonly PUBLIC_UMAMI_WEBSITE_ID?: string;
  /** Optional Google Search Console verification token (prefer DNS TXT). */
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  /** Optional Bing Webmaster verification token (prefer DNS TXT). */
  readonly PUBLIC_BING_SITE_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
