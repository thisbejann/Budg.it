/**
 * Convert a hex color to rgba with the given opacity.
 * Handles both 3-char (#RGB) and 6-char (#RRGGBB) hex.
 */
export function withOpacity(hex: string, opacity: number): string {
  let r: number, g: number, b: number;

  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
