import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          tint: '#ebf0dd',
          container: {
            DEFAULT: '#ebf0dd',
            low: '#f1f6e3',
            high: '#e5ead8',
            highest: '#e0e5d2',
            lowest: '#ffffff',
          },
        },
        primary: {
          DEFAULT: '#5b6300',
          container: '#d3e056',
          foreground: '#ffffff',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#5a6200',
        secondary: {
          DEFAULT: '#5b5f4e',
          container: '#dfe3cf',
          foreground: '#ffffff',
        },
        'on-surface': {
          DEFAULT: '#181d12',
          variant: '#464841',
        },
        'on-surface-variant': '#464841',
        outline: {
          DEFAULT: '#767870',
          variant: '#c6c7be',
        },
        inverse: {
          surface: '#2d3226',
          'on-surface': '#eef3e0',
          primary: '#c2cf47',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        label: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        sm: '0.5rem',
        md: '0.75rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
        full: '9999px',
      },
      boxShadow: {
        premium: '0 4px 32px -4px rgba(91, 99, 0, 0.12), 0 2px 8px -2px rgba(91, 99, 0, 0.08)',
        editorial: '0 8px 48px -8px rgba(24, 29, 18, 0.16), 0 4px 16px -4px rgba(24, 29, 18, 0.10)',
        float: '0 16px 64px -12px rgba(24, 29, 18, 0.20), 0 8px 24px -6px rgba(24, 29, 18, 0.12)',
        card: '0 2px 16px -2px rgba(91, 99, 0, 0.08), 0 1px 4px -1px rgba(24, 29, 18, 0.06)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '72ch',
            color: '#181d12',
            lineHeight: '1.8',
          },
        },
      },
    },
  },
  plugins: [],
}

export default config
