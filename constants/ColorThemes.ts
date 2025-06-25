/**
 * Расширенная система тем с различными цветовыми схемами
 */

// Базовый интерфейс для цветовой схемы
interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  icon: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

// Различные цветовые темы
export const ColorThemes = {
  // Современная индиго тема
  indigo: {
    light: {
      primary: '#6366f1',
      primaryLight: '#a5b4fc',
      primaryDark: '#4338ca',
      secondary: '#8b5cf6',
      background: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      icon: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    } as ColorPalette,
    dark: {
      primary: '#818cf8',
      primaryLight: '#a5b4fc',
      primaryDark: '#6366f1',
      secondary: '#a78bfa',
      background: '#0f172a',
      surface: '#1e293b',
      card: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#475569',
      icon: '#94a3b8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    } as ColorPalette,
  },

  // Розовая тема
  pink: {
    light: {
      primary: '#ec4899',
      primaryLight: '#f9a8d4',
      primaryDark: '#be185d',
      secondary: '#8b5cf6',
      background: '#ffffff',
      surface: '#fdf2f8',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#f3e8ff',
      icon: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    } as ColorPalette,
    dark: {
      primary: '#f472b6',
      primaryLight: '#f9a8d4',
      primaryDark: '#ec4899',
      secondary: '#a78bfa',
      background: '#1a0d1a',
      surface: '#2d1b2d',
      card: '#2d1b2d',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#44374a',
      icon: '#94a3b8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    } as ColorPalette,
  },

  // Зеленая тема
  emerald: {
    light: {
      primary: '#10b981',
      primaryLight: '#6ee7b7',
      primaryDark: '#047857',
      secondary: '#3b82f6',
      background: '#ffffff',
      surface: '#f0fdf4',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#dcfce7',
      icon: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    } as ColorPalette,
    dark: {
      primary: '#34d399',
      primaryLight: '#6ee7b7',
      primaryDark: '#10b981',
      secondary: '#60a5fa',
      background: '#0a1a0f',
      surface: '#1a2e1f',
      card: '#1a2e1f',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#374444',
      icon: '#94a3b8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    } as ColorPalette,
  },

  // Оранжевая тема
  orange: {
    light: {
      primary: '#f97316',
      primaryLight: '#fed7aa',
      primaryDark: '#c2410c',
      secondary: '#3b82f6',
      background: '#ffffff',
      surface: '#fff7ed',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#fed7aa',
      icon: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    } as ColorPalette,
    dark: {
      primary: '#fb923c',
      primaryLight: '#fed7aa',
      primaryDark: '#f97316',
      secondary: '#60a5fa',
      background: '#1a0f0a',
      surface: '#2d1f1a',
      card: '#2d1f1a',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#44372d',
      icon: '#94a3b8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    } as ColorPalette,
  },

  // Фиолетовая тема
  violet: {
    light: {
      primary: '#8b5cf6',
      primaryLight: '#c4b5fd',
      primaryDark: '#7c3aed',
      secondary: '#ec4899',
      background: '#ffffff',
      surface: '#faf5ff',
      card: '#ffffff',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e9d5ff',
      icon: '#64748b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    } as ColorPalette,
    dark: {
      primary: '#a78bfa',
      primaryLight: '#c4b5fd',
      primaryDark: '#8b5cf6',
      secondary: '#f472b6',
      background: '#150a1a',
      surface: '#2a1a2e',
      card: '#2a1a2e',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#44374a',
      icon: '#94a3b8',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    } as ColorPalette,
  },
};

// Типы для тем
export type ThemeName = keyof typeof ColorThemes;
export type ThemeMode = 'light' | 'dark';

// Функция для получения цветов по имени темы
export const getThemeColors = (themeName: ThemeName, mode: ThemeMode): ColorPalette => {
  return ColorThemes[themeName][mode];
};

// Названия тем для отображения в интерфейсе
export const ThemeNames: Record<ThemeName, string> = {
  indigo: 'Индиго',
  pink: 'Розовая',
  emerald: 'Изумрудная',
  orange: 'Оранжевая',
  violet: 'Фиолетовая',
};

// Иконки для тем
export const ThemeIcons: Record<ThemeName, string> = {
  indigo: 'water',
  pink: 'flower',
  emerald: 'leaf',
  orange: 'sunny',
  violet: 'diamond',
};