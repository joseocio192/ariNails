/**
 * Design System - Colors
 * Centralized color tokens following design system principles
 */

export const colors = {
  // Primary brand colors
  primary: {
    50: '#f5f2e8',
    100: '#ede9dc',
    200: '#d4c9b8',
    300: '#baa894',
    400: '#a08770',
    500: '#7d9674', // Main brand color
    600: '#5f7556',
    700: '#4a5c42',
    800: '#35432f',
    900: '#202a1b',
  },

  // Semantic colors
  success: {
    50: '#f0f9f0',
    500: '#10b981',
    600: '#059669',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Background colors
  background: {
    primary: '#f5f2e8',
    secondary: '#fefdfb',
    card: '#ffffff',
  },

  // Text colors
  text: {
    primary: '#2d3319',
    secondary: '#525252',
    muted: '#737373',
    inverse: '#ffffff',
  },
} as const;

/**
 * Legacy color constants for backward compatibility
 */
export const ACCENT_GRADIENT = 'linear-gradient(135deg, #7d9674 0%, #5f7556 100%)';
export const ACCENT_SOLID = colors.primary[500];
export const ACCENT_HOVER = colors.primary[600];
export const BACKGROUND = `linear-gradient(180deg, ${colors.background.primary} 0%, ${colors.primary[100]} 100%)`;
export const HEADER_BG = colors.background.primary;
export const FOOTER_BG = colors.background.primary;
export const CARD_BG = colors.background.card;
export const TEXT_PRIMARY = colors.text.primary;