import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';

interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: {
    name: string;
    onPress: () => void;
  };
  isDark?: boolean;
  colors?: any;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
  showBackButton = false,
  onBackPress,
  rightIcon,
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  return (
    <View style={[
      styles.header, 
      { 
        backgroundColor: colors.card,
        borderBottomColor: colors.border
      }
    ]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {actionText && (
          <TouchableOpacity onPress={onActionPress}>
            <Text style={[styles.actionText, { color: colors.placeholder }]}>{actionText}</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={rightIcon.onPress}
          >
            <Ionicons name={rightIcon.name as any} size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionText: {
    fontSize: 14,
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default SectionHeader;