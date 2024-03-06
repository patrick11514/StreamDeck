/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                text: '#070709',
                background: '#fcfcfd',
                primary: '#1932f0',
                secondary: '#7f8ceb',
                accent: '#4f62f8',
                'text-dark': '#f6f6f8',
                'background-dark': '#020203',
                'primary-dark': '#0f28e6',
                'secondary-dark': '#142180',
                'accent-dark': '#071bb0'
            }
        }
    },
    plugins: []
}
