/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
				heading: ['Outfit', '-apple-system', 'sans-serif'],
			},
			colors: {
				trueblack: {
					900: '#0a0a0a',
					800: '#111111',
					700: '#1a1a1a',
				},
				gold: {
					50: '#fbf8eb',
					100: '#f5eccd',
					200: '#ebd89e',
					300: '#dfbf68',
					400: '#D4AF37', // Champagne Gold base
					500: '#c58d2d',
					600: '#aa7223',
					700: '#88561f',
					800: '#704520',
					900: '#5e3a1f',
					950: '#362010',
				},
			},
			animation: {
				'float': 'float 6s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
			},
			keyframes: {
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				glow: {
					'0%': { boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)' },
					'100%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)' },
				}
			}
		},
	},
	plugins: [],
}




