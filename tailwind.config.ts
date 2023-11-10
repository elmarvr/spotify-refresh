import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,ts,tsx}'],
	theme: {
		extend: {
			animation: {
				'slide-up': 'slide-up 0.3s ease-out',
			},
			keyframes: {
				'slide-up': {
					'0%': {
						transform: 'translateY(200%)',
					},
					'100%': {
						transform: 'translateY(0)',
					},
				},
			},
		},
	},
	plugins: [],
} satisfies Config;
