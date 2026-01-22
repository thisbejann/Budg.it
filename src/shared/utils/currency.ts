// Philippine Peso (PHP) currency formatting utilities

/**
 * Format a number as Philippine Peso currency
 * @param amount - The amount to format
 * @param showSign - Whether to show + or - sign
 * @returns Formatted string like "₱1,234.56"
 */
export function formatPHP(amount: number, showSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign) {
    if (amount > 0) return `+${formatted}`;
    if (amount < 0) return `-${formatted}`;
  } else if (amount < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

/**
 * Format a number as a compact currency (for charts/summaries)
 * @param amount - The amount to format
 * @returns Formatted string like "₱1.2K" or "₱1.5M"
 */
export function formatPHPCompact(amount: number): string {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 1000000) {
    return `${sign}₱${(absAmount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}₱${(absAmount / 1000).toFixed(1)}K`;
  }
  return `${sign}₱${absAmount.toFixed(0)}`;
}

/**
 * Parse a currency string to number
 * @param value - String value that may contain currency symbols
 * @returns Parsed number
 */
export function parseCurrencyInput(value: string): number {
  // Remove currency symbol, commas, and whitespace
  const cleaned = value.replace(/[₱,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number for input field (no currency symbol)
 * @param amount - The amount to format
 * @returns Formatted string like "1234.56"
 */
export function formatForInput(amount: number): string {
  return amount.toFixed(2);
}
