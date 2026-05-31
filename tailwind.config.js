/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        candy: {
          50: '#f9f8fb',
          100: '#f2f0f5',
          200: '#e6e2ec',
          300: '#d1cad9',
          400: '#b0a8bc',
          500: '#91889f',
          600: '#756d83',
          700: '#5e5769',
          800: '#474252',
          900: '#312e3a',
          950: '#1e1c24',
        },
        primary: {
          DEFAULT: '#6b6578',
          dark: '#474252',
          light: '#91889f',
          soft: '#f2f0f5',
        },
        accent: {
          DEFAULT: '#9f8fd4',
          light: '#b8aae0',
          soft: '#ede9f8',
        },
        pastel: {
          lavender: '#e8e2f8',
          rose: '#fce7ef',
          mint: '#ddf5ec',
          peach: '#ffeede',
          sky: '#e3f2fc',
          lemon: '#faf3d4',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(71, 66, 82, 0.07)',
        glow: '0 8px 32px rgba(107, 101, 120, 0.14)',
        candy: '0 2px 12px rgba(159, 143, 212, 0.12)',
      },
      backgroundImage: {
        'candy-mesh':
          'radial-gradient(ellipse at 15% 0%, rgba(232, 226, 248, 0.55) 0%, transparent 52%), radial-gradient(ellipse at 85% 8%, rgba(252, 231, 239, 0.45) 0%, transparent 48%), radial-gradient(ellipse at 50% 100%, rgba(221, 245, 236, 0.4) 0%, transparent 55%)',
        'candy-header':
          'linear-gradient(135deg, #474252 0%, #6b6578 45%, #9f8fd4 100%)',
        'candy-banner':
          'linear-gradient(120deg, #474252 0%, #6b6578 50%, #756d83 100%)',
      },
    },
  },
  plugins: [],
};
