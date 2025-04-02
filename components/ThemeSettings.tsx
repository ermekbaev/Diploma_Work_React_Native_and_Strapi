import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Компонент для выбора темы в настройках
 */
const ThemeSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { theme: currentTheme, colors } = useAppTheme();
  
  const selectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Настройки темы</Text>
      
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
          <Ionicons name="checkmark" size={24} color={colors.tint} />
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
          <Ionicons name="checkmark" size={24} color={colors.tint} />
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
            <Text style={[styles.optionDescription, { color: colors.placeholder }]}>
              Следовать настройкам устройства
            </Text>
          </View>
        </View>
        {theme === 'system' && (
          <Ionicons name="checkmark" size={24} color={colors.tint} />
        )}
      </TouchableOpacity>
      
      {/* Информация о текущей теме */}
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: colors.placeholder }]}>
          {theme === 'system' ? 
            'Тема будет изменяться в соответствии с системными настройками.' : 
            'Тема не будет изменяться при смене системных настроек.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  selectedOption: {
    // Можно добавить стили для выделения выбранной опции
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 16,
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  infoContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ThemeSettings;