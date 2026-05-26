# Screenshots

Drop product screenshots here. The hero references `library.png` — a 16:10
shot of Minch's Library view (Active or Downloaded tab) at roughly
2400×1500 (retina) works well inside the `<ScreenshotFrame>` chrome.

Once the app UI is settled:

1. Capture the Library view at full window size (⌘⇧3 with the window
   selector, then crop).
2. Export as PNG, optimize with `oxipng -o 4 library.png` or similar.
3. Replace the placeholder reference in `src/components/ScreenshotFrame.astro`.
