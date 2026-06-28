# Screenshots

`library.png` is the Library-view capture shown in the hero. It has been
**sanitized**: the account email is masked and every transfer title was
replaced with defensible content (Linux distro ISOs and Blender open movies),
so no personal data or named copyrighted/pirated titles appear on a public page.

To refresh it from a new capture:

1. Sign into a throwaway/demo TorBox account (no personal email on screen) and
   queue only defensible content — Linux ISOs, Blender open movies, etc.
2. Capture the Library view at full window size (⌘⇧3 with the window
   selector, then crop to ~2560×1520, 16:10-ish).
3. Export as PNG, downscale to ~2048px wide (retina for the `max-w-5xl` frame)
   and optimize (`oxipng -o 4`, `pngquant`, or `sharp`).
4. Drop it here as `library.png` — `index.astro` references it inside
   `<ScreenshotFrame chrome={false}>`.
