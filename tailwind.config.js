/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        screens: {
            xs: '289px',
            sm: '640px',
            msm: '689px',
            md: '768px',
            lg: '1024px',
            xl: '1280px'
        },
        fontFamily: {
            poppins: ['Poppins', 'sans-serif']
        },
        extend: {}
    },
    plugins: []
};
