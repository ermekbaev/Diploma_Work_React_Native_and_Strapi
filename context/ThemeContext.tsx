import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Возможные значения темы
type ThemeType = 'light' | 'dark' | 'system';

// Интерфейс контекста темы
interface ThemeContextType {
  theme: ThemeType;
  currentTheme: 'light' | 'dark'; // Актуальная применяемая тема
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

// Создаем контекст
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Провайдер темы
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Получаем системную тему устройства
  const deviceTheme = useDeviceColorScheme();
  
  // Состояние выбранной темы
  const [theme, setThemeState] = useState<ThemeType>('system');
  
  // Актуальная применяемая тема (светлая или темная)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(
    deviceTheme === 'dark' ? 'dark' : 'light'
  );

  // Загружаем сохраненную тему при первой загрузке
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    
    loadSavedTheme();
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

  // Функция для переключения между светлой и темной темой
  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Предоставляем контекст
  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        setTheme,
        toggleTheme
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