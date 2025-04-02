import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

interface ThemeSwitchProps {
  showLabel?: boolean;
  style?: any;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ showLabel = true, style }) => {
  const { theme, currentTheme, setTheme } = useTheme();
  
  // Определяем, включен ли переключатель
  const isEnabled = currentTheme === 'dark';
  
  // Обработчик переключения
  const toggleSwitch = () => {
    setTheme(isEnabled ? 'light' : 'dark');
  };
  
  // Обработчик переключения в системный режим
  const toggleSystemTheme = () => {
    setTheme('system');
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Ionicons 
            name={isEnabled ? 'moon' : 'sunny'} 
            size={18} 
            color={isEnabled ? Colors.dark.tint : Colors.light.tint} 
          />
          <Text 
            style={[
              styles.label, 
              {color: isEnabled ? Colors.dark.text : Colors.light.text}
            ]}
          >
            {isEnabled ? 'Темная тема' : 'Светлая тема'}
          </Text>
        </View>
      )}
      
      <View style={styles.switchContainer}>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isEnabled ? Colors.dark.tint : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        
        {theme !== 'system' && (
          <TouchableOpacity 
            style={styles.systemButton}
            onPress={toggleSystemTheme}
          >
            <Text style={styles.systemButtonText}>Системная</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  systemButtonText: {
    fontSize: 12,
    color: '#666666',
  },
});

export default ThemeSwitch;