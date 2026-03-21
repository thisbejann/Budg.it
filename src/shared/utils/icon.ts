import * as LucideIcons from 'lucide-react-native';

/**
 * Convert kebab-case icon name (e.g. "credit-card") to the
 * PascalCase component name used by lucide-react-native (e.g. "creditCard").
 */
export function toIconComponentName(kebabName: string): string {
  return kebabName
    .split('-')
    .map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)))
    .join('');
}

/**
 * Resolve a kebab-case icon name to its Lucide component, with a fallback.
 */
export function getIconComponent(
  kebabName: string,
  fallback: keyof typeof LucideIcons = 'Circle',
): React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> {
  const componentName = toIconComponentName(kebabName);
  return (LucideIcons as any)[componentName] || (LucideIcons as any)[fallback];
}
