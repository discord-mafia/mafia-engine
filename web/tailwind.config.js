/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			backgroundImage: {
				chalkboard: "url('/chalkboard.jpg')",
			},
			fontFamily: {
				raleway: ['Raleway', 'sans-serif'],
			},
			animation: {
				grow: 'spin 3s linear infinite',
			},
			height: {
				smallview: '100svh',
			},
			backgroundColor: {
				darkGray: '#1F1F1F',
			},
		},
	},
	plugins: [],
};
