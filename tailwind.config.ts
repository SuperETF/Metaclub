import type { Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';
import lineClamp from '@tailwindcss/line-clamp';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
      },
      borderRadius: {
        button: '9999px',
      },
    },
  },
  plugins: [
    scrollbar,
    lineClamp,
  ],
};

export default config;
