import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveUserTheme,
  toggleTheme,
  getThemeAccessibilityDetails,
} from './themeManager';

test('resolveUserTheme prioritizes user profile preference over localStorage', () => {
  const theme = resolveUserTheme('light', 'dark');
  assert.equal(theme, 'light');
});

test('resolveUserTheme falls back to localStorage if user profile has no preference', () => {
  const theme = resolveUserTheme(undefined, 'light');
  assert.equal(theme, 'light');
});

test('resolveUserTheme defaults to light if neither preference is provided', () => {
  const theme = resolveUserTheme(undefined, null);
  assert.equal(theme, 'light');
});

test('toggleTheme alternates between dark and light correctly', () => {
  assert.equal(toggleTheme('dark'), 'light');
  assert.equal(toggleTheme('light'), 'dark');
});

test('getThemeAccessibilityDetails returns WCAG AAA metrics for both themes', () => {
  const lightDetails = getThemeAccessibilityDetails('light');
  assert.equal(lightDetails.wcagLevel, 'AAA');
  assert.equal(lightDetails.mode, 'light');
  assert.match(lightDetails.contrastRatio, /14\.8:1/);

  const darkDetails = getThemeAccessibilityDetails('dark');
  assert.equal(darkDetails.wcagLevel, 'AAA');
  assert.equal(darkDetails.mode, 'dark');
  assert.match(darkDetails.contrastRatio, /9\.2:1/);
});
