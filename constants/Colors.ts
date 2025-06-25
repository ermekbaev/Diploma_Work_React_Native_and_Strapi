/**
 * Цветовая схема приложения.
 * Определяет цвета для светлой и темной темы.
 */

// Основные цвета для светлой темы
const tintColorLight = '#6366f1'; // Современный индиго
const iconColorLight = '#64748b';
const textColorLight = '#1e293b';
const backgroundColorLight = '#ffffff';

// Основные цвета для темной темы
const tintColorDark = '#818cf8'; // Светлый индиго для темной темы
const iconColorDark = '#94a3b8';
const textColorDark = '#f8fafc';
const backgroundColorDark = '#0f172a'; // Темно-синий вместо черного

export const Colors = {
  light: {
    text: textColorLight,
    background: backgroundColorLight,
    tint: tintColorLight,
    icon: iconColorLight,
    tabIconDefault: iconColorLight,
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    cardBackground: '#f8fafc', // Более теплый белый
    border: '#e2e8f0',
    notification: '#ef4444', // Красный
    placeholder: '#64748b',
    searchBackground: '#f1f5f9',
    disabled: '#cbd5e1',
    error: '#ef4444',
    success: '#22c55e', // Зеленый
    warning: '#f59e0b',  // Оранжевый
    info: '#3b82f6',     // Синий
    // Новые акцентные цвета
    primary: '#6366f1',   // Индиго
    secondary: '#8b5cf6', // Фиолетовый
    accent: '#06b6d4',    // Циан
    surface: '#f8fafc',
    onSurface: '#334155',
  },
  dark: {
    text: textColorDark,
    background: backgroundColorDark,
    tint: tintColorDark,
    icon: iconColorDark,
    tabIconDefault: iconColorDark,
    tabIconSelected: tintColorDark,
    card: '#1e293b',      // Темно-синий вместо серого
    cardBackground: '#334155',
    border: '#475569',
    notification: '#f87171',
    placeholder: '#94a3b8',
    searchBackground: '#334155',
    disabled: '#64748b',
    error: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#60a5fa',
    // Новые акцентные цвета для темной темы
    primary: '#818cf8',
    secondary: '#a78bfa',
    accent: '#22d3ee',
    surface: '#1e293b',
    onSurface: '#cbd5e1',
  },
};

// Дополнительные цветовые палитры для разных секций
export const CategoryColors = {
  electronics: '#3b82f6',
  fashion: '#ec4899',
  home: '#10b981',
  sports: '#f59e0b',
  books: '#8b5cf6',
  beauty: '#ef4444',
  toys: '#06b6d4',
  automotive: '#64748b',
};

// Градиенты для карточек
export const Gradients = {
  primary: ['#6366f1', '#8b5cf6'],
  secondary: ['#ec4899', '#f97316'],
  success: ['#22c55e', '#16a34a'],
  warning: ['#f59e0b', '#ea580c'],
  info: ['#3b82f6', '#1d4ed8'],
  sunset: ['#f97316', '#ec4899'],
  ocean: ['#06b6d4', '#3b82f6'],
  forest: ['#22c55e', '#15803d'],
};

// Типы для цветовой схемы
export type ColorScheme = keyof typeof Colors;
export type ColorNames = keyof typeof Colors.light & keyof typeof Colors.dark;