/** @type {import('tailwindcss').Config} */
// Brand tokens mirror Packages/MinchUI/Sources/MinchUI/Theme.swift so the
// site and the app stay in lockstep. If you change one, change the other.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bolt: '#3D7BFF',     // Color.minchBolt
        aqua: '#5BE2F7',     // Color.minchCurrent — renamed from `current` to avoid clobbering Tailwind's built-in currentColor keyword (text-current/stroke-current/etc.)
        surface: {
          primary: '#121212',  // minchSurfacePrimary
          elevated: '#191919', // minchSurfaceElevated
        },
        success: '#4DC673',  // Color.minchSuccess
        danger: '#F25858',   // Color.minchDanger
        warning: '#F1B033',  // Color.minchWarning
      },
      fontFamily: {
        sans: [
          '"SF Pro Display"',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'bolt-gradient':
          'linear-gradient(180deg, #3D7BFF 0%, #5BE2F7 100%)',
      },
    },
  },
  plugins: [],
};
