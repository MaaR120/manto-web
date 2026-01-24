/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aquí está el cambio importante: agregamos rutas con y sin "./src"
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        manto: {
          50: '#f4f9f4',
          100: '#e3f2e3',
          500: '#4a7c4a', // Verde Yerba Principal
          700: '#3a633a', // Verde Oscuro (Hover)
          900: '#1a2e1a', // Texto oscuro / Footer
        },
        tierra: {
          500: '#8d6e63', 
        }
      },
    },
  },
  plugins: [],
};