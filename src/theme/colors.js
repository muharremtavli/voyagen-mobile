/**
 * VoyaGen — Centralized Color Palette
 * Premium travel-themed dark design system
 */
const defaultColors = {
  // Backgrounds
  bg: '#F5ECE3',
  card: '#FFFFFF',
  surface: '#EAE0D5',
  surfaceHover: '#EBE7DE',
  
  // Borders
  border: 'rgba(93, 64, 55, 0.15)',
  borderLight: 'rgba(93, 64, 55, 0.08)',
  
  // Primary — Brown
  primary: '#4A332A',
  primaryDark: '#3A2821',
  primaryLight: '#8D6E63',
  primaryGlow: 'rgba(74, 51, 42, 0.15)',
  onPrimary: '#FFFFFF',
  
  // Secondary — Warm Orange/Gold
  secondary: '#D4A373',
  secondaryDark: '#B88A58',
  secondaryLight: '#E8C39E',
  secondaryGlow: 'rgba(212, 163, 115, 0.15)',
  
  // Accent — Terracotta
  accent: '#A65A4B',
  accentDark: '#8C4638',
  accentLight: '#C47E71',
  accentGlow: 'rgba(166, 90, 75, 0.15)',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Text
  text: '#3E2723',
  textSecondary: '#5D4037',
  muted: '#8D6E63',
  mutedLight: '#A1887F',
  white: '#FFFFFF',
  black: '#000000',
  
  // Gradients (for reference)
  gradientStart: '#5D4037',
  gradientMid: '#D4A373',
  gradientEnd: '#A65A4B',
  
  // Effects
  overlay: 'rgba(253, 251, 247, 0.85)',
  glass: 'rgba(255, 255, 255, 0.75)',
  glow: 'rgba(93, 64, 55, 0.25)',
};

export const THEMES = {
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    swatches: ['#F8F9FA', '#000000'],
    ...defaultColors,
    bg: 'transparent',
    card: 'rgba(255, 255, 255, 0.85)',
    surface: 'rgba(233, 236, 239, 0.85)',
    surfaceHover: 'rgba(222, 226, 230, 0.85)',
    text: '#212529',
    textSecondary: '#495057',
    primary: '#000000',
    primaryLight: '#495057',
    border: 'rgba(0, 0, 0, 0.15)',
    borderLight: 'rgba(0, 0, 0, 0.08)',
    gradientStart: '#F8F9FA',
    gradientEnd: '#E9ECEF',
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    swatches: ['#FDFBF7', '#4A332A'],
    ...defaultColors,
    bg: 'transparent',
    card: 'rgba(255, 255, 255, 0.85)',
    surface: 'rgba(234, 224, 213, 0.85)',
    surfaceHover: 'rgba(235, 231, 222, 0.85)',
    text: '#3E2723',
    textSecondary: '#5D4037',
    primary: '#4A332A',
    primaryLight: '#8D6E63',
    border: 'rgba(74, 51, 42, 0.15)',
    borderLight: 'rgba(74, 51, 42, 0.08)',
    gradientStart: '#FDFBF7',
    gradientEnd: '#EAE0D5',
  },
  breeze: {
    id: 'breeze',
    name: 'Breeze',
    swatches: ['#E0F7FA', '#00796B'],
    ...defaultColors,
    bg: 'transparent',
    card: 'rgba(255, 255, 255, 0.85)',
    surface: 'rgba(232, 245, 233, 0.85)',
    surfaceHover: 'rgba(200, 230, 201, 0.85)',
    text: '#004D40',
    textSecondary: '#00695C',
    primary: '#00796B',
    primaryLight: '#26A69A',
    border: 'rgba(0, 121, 107, 0.15)',
    borderLight: 'rgba(0, 121, 107, 0.08)',
    gradientStart: '#E0F7FA',
    gradientEnd: '#E8F5E9',
  }
};

export const DARK_THEMES = {
  monochrome: {
    bg: 'transparent', card: 'rgba(33, 37, 41, 0.85)', surface: 'rgba(52, 58, 64, 0.85)', surfaceHover: 'rgba(73, 80, 87, 0.85)',
    text: '#F8F9FA', textSecondary: '#CED4DA',
    primary: '#FFFFFF', primaryLight: '#DEE2E6', onPrimary: '#000000',
    border: 'rgba(255, 255, 255, 0.15)', borderLight: 'rgba(255, 255, 255, 0.08)',
    gradientStart: '#212529', gradientEnd: '#000000',
  },
  earth: {
    bg: 'transparent', card: 'rgba(58, 40, 33, 0.85)', surface: 'rgba(74, 51, 42, 0.85)', surfaceHover: 'rgba(93, 64, 55, 0.85)',
    text: '#F5ECE3', textSecondary: '#EAE0D5',
    primary: '#D4A373', primaryLight: '#E8C39E', onPrimary: '#3E2723',
    border: 'rgba(212, 163, 115, 0.15)', borderLight: 'rgba(212, 163, 115, 0.08)',
    gradientStart: '#3A2821', gradientEnd: '#221510',
  },
  breeze: {
    bg: 'transparent', card: 'rgba(0, 77, 64, 0.85)', surface: 'rgba(0, 105, 92, 0.85)', surfaceHover: 'rgba(0, 121, 107, 0.85)',
    text: '#E0F2F1', textSecondary: '#B2DFDB',
    primary: '#4DB6AC', primaryLight: '#80CBC4', onPrimary: '#004D40',
    border: 'rgba(77, 182, 172, 0.15)', borderLight: 'rgba(77, 182, 172, 0.08)',
    gradientStart: '#004D40', gradientEnd: '#1B5E20',
  }
};

export const AVAILABLE_THEMES = Object.values(THEMES).map(({ id, name, swatches }) => ({ id, name, swatches }));

export const getThemeColors = (themeName, isDark = false) => {
  const baseTheme = THEMES[themeName] || THEMES.monochrome;
  if (isDark) {
    const darkVariant = DARK_THEMES[themeName] || DARK_THEMES.monochrome;
    return { ...baseTheme, ...darkVariant };
  }
  return baseTheme;
};

export const COLORS = { ...defaultColors };

export const applyTheme = (themeName, isDark = false) => {
    const newTheme = getThemeColors(themeName, isDark);
    Object.assign(COLORS, newTheme);
};

export default COLORS;
