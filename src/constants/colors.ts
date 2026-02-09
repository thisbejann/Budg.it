// Material Design 3 Color System with Fnatic Orange (#FF5900) as primary

export const COLORS = {
  // MD3 Light palette
  background: '#FFFBFF',
  foreground: '#201A17',
  surface: '#FFFBFF',
  surfaceContainer: '#F5EDE8',
  surfaceContainerLow: '#FFF8F6',
  surfaceContainerHigh: '#EFE6E1',
  surfaceVariant: '#F5DED4',
  card: '#FFFFFF',
  cardForeground: '#201A17',
  primary: '#FF5900',
  primaryContainer: '#FFDBCC',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#341100',
  primaryForeground: '#FFFFFF',
  secondary: '#775750',
  secondaryContainer: '#FFDAD1',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#2C1510',
  secondaryForeground: '#5D4037',
  muted: '#F5DED4',
  mutedForeground: '#6F5B53',
  accent: '#FFDAD1',
  accentForeground: '#410001',
  destructive: '#BA1A1A',
  destructiveForeground: '#FFFFFF',
  border: '#D8C2B8',
  input: '#D8C2B8',
  ring: '#FF5900',
  outline: '#85736B',
  outlineVariant: '#D8C2B8',

  // Account type colors
  accountDebit: '#22c55e',
  accountCredit: '#f97316',
  accountOwed: '#3b82f6',
  accountDebt: '#ef4444',

  // Transaction type colors
  income: '#22c55e',
  expense: '#ef4444',

  // Status colors
  warning: '#eab308',

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

// MD3 Dark palette - improved contrast
export const COLORS_DARK = {
  background: '#1A1110',
  foreground: '#F5DFDA',
  surface: '#1A1110',
  surfaceContainer: '#2A1F1C',
  surfaceContainerLow: '#211715',
  surfaceContainerHigh: '#352A27',
  surfaceVariant: '#52443D',
  card: '#2D2420',
  cardForeground: '#F5DFDA',
  primary: '#FFB599',
  primaryContainer: '#8B3300',
  onPrimary: '#561F00',
  onPrimaryContainer: '#FFDBCC',
  primaryForeground: '#561F00',
  secondary: '#E7BDB2',
  secondaryContainer: '#5D3F37',
  onSecondary: '#442A23',
  onSecondaryContainer: '#FFDAD1',
  secondaryForeground: '#442A23',
  muted: '#3D302B',
  mutedForeground: '#BCA9A2',
  accent: '#E7BDB2',
  accentForeground: '#442A23',
  destructive: '#DC2626',
  destructiveForeground: '#FFFFFF',
  border: '#5D4B44',
  input: '#5D4B44',
  ring: '#FFB599',
  outline: '#A08D85',
  outlineVariant: '#52443D',

  // Account type colors (brighter for dark mode)
  accountDebit: '#4ade80',
  accountCredit: '#fb923c',
  accountOwed: '#60a5fa',
  accountDebt: '#f87171',

  // Transaction type colors (brighter for dark mode)
  income: '#4ade80',
  expense: '#f87171',

  // Status colors (brighter for dark mode)
  warning: '#facc15',

  // Chart colors palette (same as light)
  chartColors: [
    '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf',
    '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#9ca3af',
  ],

  // Gradient backgrounds for cards (same as light)
  gradients: {
    debit: ['#22c55e', '#16a34a'],
    credit: ['#f97316', '#ea580c'],
    owed: ['#3b82f6', '#2563eb'],
    debt: ['#ef4444', '#dc2626'],
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
