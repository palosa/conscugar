/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C2410C', // Terracota arquitectónico (orange-700)
          dark: '#9A3412',    // Arcilla intensa (orange-800)
          light: '#FFF7ED',   // Crema terracota suave
        },
        dark: {
          DEFAULT: '#1C1917', // Grafito arquitectónico (stone-900)
          lighter: '#F2EFE9', // Piedra caliza cálida (superficie secundaria)
          muted: '#57534E',   // Gris piedra técnico (stone-600)
        },
        surface: {
          DEFAULT: '#F7F5F0', // Alabastro cálido principal
          card: '#FFFFFF',    // Blanco puro para tarjetas
          border: '#E6E2D8',  // Línea técnica de plano
        }
      },
      fontFamily: {
        outfit: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

