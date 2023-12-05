import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': '#131313',
        'secondary-color': '#B7E21B',
        'tertiary-color': '#49DE80',
        'show-color': '#4A13EE',
        'purple-color': '#C8AFFE',
      },
    },
  },
  plugins: [],
}
export default config
