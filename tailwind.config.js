const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: withAlpha('--c-page'),
        panel: withAlpha('--c-panel'),
        deep: withAlpha('--c-deep'),
        raised: withAlpha('--c-raised'),
        line: withAlpha('--c-line'),
        ink: withAlpha('--c-ink'),
        muted: withAlpha('--c-muted'),
        subtle: withAlpha('--c-subtle'),
        primary: {
          400: withAlpha('--c-primary-400'),
          500: withAlpha('--c-primary-500'),
          600: withAlpha('--c-primary-600'),
        },
        error: {
          400: withAlpha('--c-error-400'),
          500: withAlpha('--c-error-500'),
        },
        accent: {
          500: withAlpha('--c-accent-500'),
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'fade-up': 'fade-up 160ms ease-out both',
      },
    },
  },
  plugins: [],
};
