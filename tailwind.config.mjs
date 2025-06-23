// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     './pages/**/*.{js,ts,jsx,tsx,mdx}', // if using pages directory
//     './components/**/*.{js,ts,jsx,tsx,mdx}', // all components directory
//     './app/**/*.{js,ts,jsx,tsx,mdx}', // if using app directory
//     './styles/**/*.{css,scss}',
//   ],
//   darkMode: ['class'],
// };

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // components directory
    './app/**/*.{js,ts,jsx,tsx,mdx}', // app directory
    './styles/**/*.{css,scss}', // styles directory
  ],
  darkMode: ['class'],
};
