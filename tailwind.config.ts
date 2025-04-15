// tailwind.config.ts
import type { Config } from 'tailwindcss';
import plugin from 'tailwind-scrollbar-hide';

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
  plugins: [plugin],
};

export default config;
