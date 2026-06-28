import { GITHUB_OWNER, GITHUB_REPO } from '../config';

/**
 * Build-time count of true `.dmg` downloads, summed across all GitHub Releases
 * assets (GitHub's `download_count` is the ground-truth number).
 *
 * Designed to fail *silently*: any network/parse/rate-limit error returns null
 * so the site builds fine offline and simply hides the figure. Never throws.
 * Returns null (not 0) when unavailable or when the count is zero, so callers
 * can treat "no number to show" uniformly.
 */
export async function getDmgDownloadCount(): Promise<number | null> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'minch-site-build',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const releases: unknown = await res.json();
    if (!Array.isArray(releases)) return null;

    let total = 0;
    for (const release of releases) {
      const assets = (release as { assets?: unknown }).assets;
      if (!Array.isArray(assets)) continue;
      for (const asset of assets) {
        const name = (asset as { name?: unknown }).name;
        const count = (asset as { download_count?: unknown }).download_count;
        if (typeof name === 'string' && name.toLowerCase().endsWith('.dmg')) {
          total += typeof count === 'number' ? count : 0;
        }
      }
    }
    return total > 0 ? total : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
