/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // shadcn-inspired color palette
        border: 'hsl(214.3, 31.8%, 91.4%)',
        input: 'hsl(214.3, 31.8%, 91.4%)',
        ring: 'hsl(221.2, 83.2%, 53.3%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(222.2, 84%, 4.9%)',
        primary: {
          DEFAULT: 'hsl(221.2, 83.2%, 53.3%)',
          foreground: 'hsl(210, 40%, 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(222.2, 47.4%, 11.2%)',
        },
        destructive: {
          DEFAULT: 'hsl(0, 84.2%, 60.2%)',
          foreground: 'hsl(210, 40%, 98%)',
        },
        muted: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(215.4, 16.3%, 46.9%)',
        },
        accent: {
          DEFAULT: 'hsl(210, 40%, 96.1%)',
          foreground: 'hsl(222.2, 47.4%, 11.2%)',
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(222.2, 84%, 4.9%)',
        },
        // Category colors for charts
        expense: {
          food: '#ef4444',
          transport: '#f97316',
          bills: '#eab308',
          shopping: '#22c55e',
          entertainment: '#14b8a6',
          health: '#06b6d4',
          education: '#3b82f6',
          personal: '#8b5cf6',
          travel: '#ec4899',
          other: '#6b7280',
        },
        income: {
          salary: '#22c55e',
          business: '#3b82f6',
          investments: '#8b5cf6',
          freelance: '#f97316',
          other: '#6b7280',
        },
        // Account type colors
        account: {
          debit: '#22c55e',
          credit: '#f97316',
          owed: '#3b82f6',
          debt: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
