import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';
import ThemeSettings from '@/components/ThemeSettings';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, colors } = useAppTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Шапка с кнопкой назад */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Настройки</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Раздел настроек темы */}
        <ThemeSettings />
        
        {/* Другие разделы настроек */}
        <View style={[styles.settingsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Уведомления</Text>
          <SettingsItem 
            icon="notifications-outline" 
            title="Push-уведомления" 
            isSwitch={true}
            colors={colors}
          />
          <SettingsItem 
            icon="mail-outline" 
            title="Email-рассылка" 
            isSwitch={true}
            colors={colors}
          />
        </View>
        
        <View style={[styles.settingsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Приложение</Text>
          <SettingsItem 
            icon="information-circle-outline" 
            title="О приложении" 
            colors={colors}
          />
          <SettingsItem 
            icon="document-text-outline" 
            title="Условия использования" 
            colors={colors}
          />
          <SettingsItem 
            icon="shield-checkmark-outline" 
            title="Политика конфиденциальности" 
            colors={colors}
            isLast
          />
        </View>
        
        <View style={[styles.settingsSection, { backgroundColor: colors.card }]}>
          <SettingsItem 
            icon="log-out-outline" 
            title="Выйти" 
            titleColor={colors.error}
            colors={colors}
            isLast
          />
        </View>
        
        <Text style={[styles.versionText, { color: colors.placeholder }]}>
          Версия 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// Компонент элемента настройки
interface SettingsItemProps {
  icon: string;
  title: string;
  isSwitch?: boolean;
  isLast?: boolean;
  titleColor?: string;
  colors: any;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  title, 
  isSwitch = false, 
  isLast = false,
  titleColor,
  colors
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.settingsItem, 
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
      ]}
    >
      <View style={styles.settingsItemContent}>
        <Ionicons name={icon as any} size={22} color={colors.icon} style={styles.settingsItemIcon} />
        <Text style={[styles.settingsItemTitle, { color: titleColor || colors.text }]}>
          {title}
        </Text>
      </View>
      
      {isSwitch ? (
        <View style={styles.switchPlaceholder} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40, // Для баланса с кнопкой назад
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingsSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemIcon: {
    marginRight: 16,
  },
  settingsItemTitle: {
    fontSize: 16,
  },
  switchPlaceholder: {
    width: 50,
    height: 30,
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
  },
  versionText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 14,
  },
});