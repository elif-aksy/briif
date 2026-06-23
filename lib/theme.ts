import type { Category } from '../types';

export const colors = {
  background: '#0F0F0F',
  surfaceContainer: '#20201f',
  surfaceContainerLow: '#1c1b1b',
  surfaceContainerHigh: '#2a2a2a',
  surfaceContainerHighest: '#353535',
  onSurface: '#e5e2e1',
  onSurfaceVariant: '#c2c6d6',
  outline: '#8c909f',
  outlineVariant: '#424754',
  primary: '#adc6ff',
  onPrimaryContainer: '#00285d',
  secondary: '#4edea3',
  onSecondary: '#003824',
  tertiary: '#ffb786',
  error: '#ffb4ab',
};

export const radius = {
  lg: 8,
  xl: 12,
  full: 999,
};

export const CATEGORY_COLORS: Record<Category, string> = {
  siyaset: colors.error,
  ekonomi: colors.secondary,
  spor: colors.primary,
  teknoloji: colors.primary,
  dünya: colors.secondary,
  sağlık: colors.tertiary,
  kültür: colors.tertiary,
  gündem: colors.primary,
};
