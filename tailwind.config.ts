import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        // Mercanio brand tokens — use these in all components
        sienna:  {
          DEFAULT: '#C2692A',
          hover:   '#A85A24',
          light:   '#F5E6D8',
          text:    '#9A5220',
        },
        ink: {
          DEFAULT:   '#1A1410',
          secondary: '#3D3028',
          tertiary:  '#8C7B6E',
          disabled:  '#B4A89C',
        },
        parchment: {
          DEFAULT: '#F5F0EB',
          subtle:  '#EDE8E2',
        },
        sand: {
          DEFAULT: '#E8DDD4',
          strong:  '#C8B9AC',
        },
        forest: {
          DEFAULT: '#2B6B4A',
          bg:      '#E6F0EB',
          text:    '#1E5C38',
        },
        ember: {
          DEFAULT: '#B54242',
          bg:      '#F5EBEB',
          text:    '#8C3A2A',
        },
        // shadcn CSS variable passthrough
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        xl:  '12px',
        '2xl': '16px',
      },
      fontSize: {
        // Mercanio type scale
        'display': ['32px', { lineHeight: '1.15', letterSpacing: '-0.8px', fontWeight: '600' }],
        'h1':      ['22px', { lineHeight: '1.2',  letterSpacing: '-0.4px', fontWeight: '600' }],
        'h2':      ['18px', { lineHeight: '1.25', letterSpacing: '-0.3px', fontWeight: '600' }],
        'h3':      ['16px', { lineHeight: '1.3',  letterSpacing: '-0.2px', fontWeight: '500' }],
        'body':    ['15px', { lineHeight: '1.65', fontWeight: '400' }],
        'sm':      ['13px', { lineHeight: '1.5',  fontWeight: '400' }],
        'xs':      ['11px', { lineHeight: '1.4',  fontWeight: '500' }],
      },
      spacing: {
        // 4px grid
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        // No decorative shadows — only functional elevation
        'card':    '0 1px 3px rgba(26, 20, 16, 0.06), 0 1px 2px rgba(26, 20, 16, 0.04)',
        'card-hover': '0 4px 12px rgba(26, 20, 16, 0.08), 0 2px 4px rgba(26, 20, 16, 0.04)',
        'dropdown': '0 8px 24px rgba(26, 20, 16, 0.10)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-8px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
}

export default config
