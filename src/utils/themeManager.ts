export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'gwoah_erp_theme_preference';

/**
 * Resolves active theme preference with the following priority:
 * 1. User profile preference in ERP database
 * 2. Cached preference in browser localStorage
 * 3. Default to 'light'
 */
export function resolveUserTheme(
  userPref?: 'dark' | 'light' | null,
  localPref?: string | null
): ThemeMode {
  if (userPref === 'dark' || userPref === 'light') {
    return userPref;
  }
  if (localPref === 'dark' || localPref === 'light') {
    return localPref;
  }
  return 'light';
}

/**
 * Toggles theme between 'dark' and 'light'.
 */
export function toggleTheme(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

/**
 * Applies theme attribute and class to the DOM root element for instant CSS cascading.
 */
export function applyThemeToDom(theme: ThemeMode, docElement?: HTMLElement | null): void {
  const root = docElement || (typeof document !== 'undefined' ? document.documentElement : null);
  if (!root) return;

  root.setAttribute('data-theme', theme);
  if (theme === 'light') {
    root.classList.add('theme-light');
    root.classList.remove('theme-dark');
  } else {
    root.classList.add('theme-dark');
    root.classList.remove('theme-light');
  }
}

/**
 * Returns accessibility metrics for the active theme to display in settings.
 */
export function getThemeAccessibilityDetails(theme: ThemeMode): {
  mode: ThemeMode;
  name: string;
  contrastRatio: string;
  wcagLevel: 'AAA' | 'AA';
  description: string;
  idealFor: string;
} {
  if (theme === 'light') {
    return {
      mode: 'light',
      name: 'High-Contrast Light Mode',
      contrastRatio: '14.8:1',
      wcagLevel: 'AAA',
      description: 'Maximum legibility with deep slate text on clean white backgrounds and sharp high-contrast structural borders.',
      idealFor: 'Daylight studying, outdoor campus use, visual impairments, and low-glare reading.',
    };
  }

  return {
    mode: 'dark',
    name: 'Gwoah Slate Dark Mode',
    contrastRatio: '9.2:1',
    wcagLevel: 'AAA',
    description: 'Deep navy-slate palette engineered to reduce eye strain during extended night research and coding sessions.',
    idealFor: 'Low-light environments, late-night studying, and battery conservation on OLED displays.',
  };
}
