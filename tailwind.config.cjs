// tailwind.config.ts
const config = {
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
  plugins: [],
};

export default config; // ✅ 타입 없어도 작동
