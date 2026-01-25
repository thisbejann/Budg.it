// Color palette for the app

export const COLORS = {
  // shadcn-inspired base colors
  background: '#ffffff',
  foreground: '#0f172a',
  card: '#ffffff',
  cardForeground: '#0f172a',
  primary: '#3b82f6',
  primaryForeground: '#f8fafc',
  secondary: '#f1f5f9',
  secondaryForeground: '#1e293b',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#f1f5f9',
  accentForeground: '#1e293b',
  destructive: '#ef4444',
  destructiveForeground: '#f8fafc',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#3b82f6',

  // Account type colors
  accountDebit: '#22c55e',
  accountCredit: '#f97316',
  accountOwed: '#3b82f6',
  accountDebt: '#ef4444',

  // Transaction type colors
  income: '#22c55e',
  expense: '#ef4444',

  // Chart colors palette
  chartColors: [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6b7280', // gray
  ],

  // Gradient backgrounds for cards
  gradients: {
    debit: ['#22c55e', '#16a34a'],
    credit: ['#f97316', '#ea580c'],
    owed: ['#3b82f6', '#2563eb'],
    debt: ['#ef4444', '#dc2626'],
  },
};

// Dark theme colors
export const COLORS_DARK = {
  // shadcn-inspired dark colors
  background: '#0f172a',
  foreground: '#f8fafc',
  card: '#1e293b',
  cardForeground: '#f8fafc',
  primary: '#3b82f6',
  primaryForeground: '#f8fafc',
  secondary: '#334155',
  secondaryForeground: '#f8fafc',
  muted: '#334155',
  mutedForeground: '#94a3b8',
  accent: '#334155',
  accentForeground: '#f8fafc',
  destructive: '#ef4444',
  destructiveForeground: '#f8fafc',
  border: '#334155',
  input: '#334155',
  ring: '#3b82f6',

  // Account type colors (same as light)
  accountDebit: '#22c55e',
  accountCredit: '#f97316',
  accountOwed: '#3b82f6',
  accountDebt: '#ef4444',

  // Transaction type colors (same as light)
  income: '#22c55e',
  expense: '#ef4444',

  // Chart colors palette (same as light)
  chartColors: [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
  ],

  // Gradient backgrounds for cards (same as light)
  gradients: {
    debit: ['#22c55e', '#16a34a'],
    credit: ['#f97316', '#ea580c'],
    owed: ['#3b82f6', '#2563eb'],
    debt: ['#ef4444', '#dc2626'],
  },
};

// Glass/Frosted glass colors for glassmorphism effect
export const GLASS = {
  light: {
    background: 'rgba(255,255,255,0.7)',
    border: 'rgba(255,255,255,0.5)',
    card: 'rgba(255,255,255,0.6)',
    overlay: 'rgba(255,255,255,0.3)',
  },
  dark: {
    background: 'rgba(30,41,59,0.7)',
    border: 'rgba(255,255,255,0.1)',
    card: 'rgba(30,41,59,0.6)',
    overlay: 'rgba(0,0,0,0.3)',
  },
};

// Color picker options for categories
export const CATEGORY_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#6b7280', // Gray
];

// Account colors
export const ACCOUNT_COLORS = [
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#eab308', // Yellow
];
