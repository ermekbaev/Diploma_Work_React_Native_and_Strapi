import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ColorThemes, ThemeName, ThemeNames, ThemeIcons } from '@/constants/ColorThemes';

/**
 * Расширенный компонент для выбора темы и цветовой схемы
 */
const ThemeSettings: React.FC = () => {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  const { theme: currentTheme, colors } = useAppTheme();
  
  const selectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const selectColorTheme = (newColorTheme: ThemeName) => {
    setColorTheme(newColorTheme);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Настройки режима темы */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Режим темы</Text>
        
        {/* Опция светлой темы */}
        <TouchableOpacity
          style={[
            styles.option,
            { borderBottomColor: colors.border },
            theme === 'light' && styles.selectedOption
          ]}
          onPress={() => selectTheme('light')}
        >
          <View style={styles.optionContent}>
            <Ionicons name="sunny" size={24} color={colors.icon} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Светлая тема</Text>
          </View>
          {theme === 'light' && (
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
        
        {/* Опция темной темы */}
        <TouchableOpacity
          style={[
            styles.option,
            { borderBottomColor: colors.border },
            theme === 'dark' && styles.selectedOption
          ]}
          onPress={() => selectTheme('dark')}
        >
          <View style={styles.optionContent}>
            <Ionicons name="moon" size={24} color={colors.icon} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Темная тема</Text>
          </View>
          {theme === 'dark' && (
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
        
        {/* Опция системной темы */}
        <TouchableOpacity
          style={[
            styles.option,
            theme === 'system' && styles.selectedOption
          ]}
          onPress={() => selectTheme('system')}
        >
          <View style={styles.optionContent}>
            <Ionicons name="settings" size={24} color={colors.icon} style={styles.optionIcon} />
            <View>
              <Text style={[styles.optionText, { color: colors.text }]}>Системная тема</Text>
              <Text style={[styles.optionDescription, { color: colors.secondary }]}>
                Следовать настройкам устройства
              </Text>
            </View>
          </View>
          {theme === 'system' && (
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Настройки цветовой схемы */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Цветовая схема</Text>
        <Text style={[styles.sectionDescription, { color: colors.secondary }]}>
          Выберите основные цвета для вашего приложения
        </Text>
        
        <View style={styles.colorThemeGrid}>
          {(Object.keys(ColorThemes) as ThemeName[]).map((themeName) => {
            const themeColors = ColorThemes[themeName][currentTheme];
            const isSelected = colorTheme === themeName;
            
            return (
              <TouchableOpacity
                key={themeName}
                style={[
                  styles.colorThemeOption,
                  { borderColor: colors.border },
                  isSelected && { 
                    borderColor: colors.primary, 
                    borderWidth: 2,
                    backgroundColor: colors.surface 
                  }
                ]}
                onPress={() => selectColorTheme(themeName)}
              >
                <View style={styles.colorPreview}>
                  <View 
                    style={[
                      styles.colorCircle, 
                      styles.primaryColor,
                      { backgroundColor: themeColors.primary }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.colorCircle, 
                      styles.secondaryColor,
                      { backgroundColor: themeColors.secondary }
                    ]} 
                  />
                </View>
                
                <Ionicons 
                  name={ThemeIcons[themeName] as any} 
                  size={20} 
                  color={themeColors.primary} 
                  style={styles.themeIcon}
                />
                
                <Text style={[
                  styles.colorThemeName, 
                  { color: colors.text },
                  isSelected && { color: colors.primary, fontWeight: '600' }
                ]}>
                  {ThemeNames[themeName]}
                </Text>
                
                {isSelected && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={colors.primary} 
                    style={styles.checkmark}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Предварительный просмотр */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Предварительный просмотр</Text>
        
        <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.previewHeader, { backgroundColor: colors.primary }]}>
            <Text style={[styles.previewTitle, { color: 'white' }]}>Пример карточки</Text>
          </View>
          <View style={styles.previewContent}>
            <Text style={[styles.previewText, { color: colors.text }]}>
              Основной текст
            </Text>
            <Text style={[styles.previewSubtext, { color: colors.secondary }]}>
              Вторичный текст
            </Text>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.previewButtonText, { color: 'white' }]}>
                Кнопка действия
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedOption: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  colorThemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorThemeOption: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  colorPreview: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  primaryColor: {
    zIndex: 2,
  },
  secondaryColor: {
    marginLeft: -8,
    zIndex: 1,
  },
  themeIcon: {
    marginBottom: 4,
  },
  colorThemeName: {
    fontSize: 12,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  previewCard: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewHeader: {
    padding: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewContent: {
    padding: 12,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 4,
  },
  previewSubtext: {
    fontSize: 12,
    marginBottom: 12,
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeSettings;