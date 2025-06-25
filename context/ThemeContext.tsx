import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorThemes, ThemeName, getThemeColors } from '@/constants/ColorThemes';

// Возможные значения темы
type ThemeType = 'light' | 'dark' | 'system';

// Интерфейс контекста темы
interface ThemeContextType {
  theme: ThemeType;
  currentTheme: 'light' | 'dark'; // Актуальная применяемая тема
  colorTheme: ThemeName; // Текущая цветовая схема
  setTheme: (theme: ThemeType) => void;
  setColorTheme: (colorTheme: ThemeName) => void;
  toggleTheme: () => void;
  colors: ReturnType<typeof getThemeColors>; // Текущие цвета
}

// Создаем контекст
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Провайдер темы
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Получаем системную тему устройства
  const deviceTheme = useDeviceColorScheme();
  
  // Состояние выбранной темы
  const [theme, setThemeState] = useState<ThemeType>('system');
  
  // Состояние цветовой схемы
  const [colorTheme, setColorThemeState] = useState<ThemeName>('indigo');
  
  // Актуальная применяемая тема (светлая или темная)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    deviceTheme === 'dark' ? 'dark' : 'light'
  );

  // Загружаем сохраненные настройки при первой загрузке
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        const [savedTheme, savedColorTheme] = await Promise.all([
          AsyncStorage.getItem('theme'),
          AsyncStorage.getItem('colorTheme')
        ]);
        
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
        
        if (savedColorTheme) {
          setColorThemeState(savedColorTheme as ThemeName);
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    };
    
    loadSavedSettings();
  }, []);

  // Обновляем текущую тему при изменении системной темы или выбранной темы
  useEffect(() => {
    let newTheme: 'light' | 'dark';
    
    if (theme === 'system') {
      // Если выбрана системная тема, используем тему устройства
      newTheme = deviceTheme === 'dark' ? 'dark' : 'light';
    } else {
      // Иначе используем выбранную пользователем тему
      newTheme = theme;
    }
    
    setCurrentTheme(newTheme);
  }, [deviceTheme, theme]);

  // Функция для установки темы
  const setTheme = async (newTheme: ThemeType) => {
    try {
      // Сохраняем тему в AsyncStorage
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Функция для установки цветовой схемы
  const setColorTheme = async (newColorTheme: ThemeName) => {
    try {
      // Сохраняем цветовую схему в AsyncStorage
      await AsyncStorage.setItem('colorTheme', newColorTheme);
      setColorThemeState(newColorTheme);
    } catch (error) {
      console.error('Error saving color theme:', error);
    }
  };

  // Функция для переключения между светлой и темной темой
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Получаем текущие цвета на основе выбранной темы и цветовой схемы
  const colors = getThemeColors(colorTheme, currentTheme);

  // Предоставляем контекст
  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        colorTheme,
        setTheme,
        setColorTheme,
        toggleTheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Хук для использования темы
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Дополнительный хук для получения только цветов (для обратной совместимости)
export const useAppTheme = () => {
  const { currentTheme, colors } = useTheme();
  return {
    theme: currentTheme,
    colors,
  };
};