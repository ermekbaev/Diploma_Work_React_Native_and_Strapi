import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
  showBackButton = false,
  onBackPress,
  rightIcon
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {actionText && (
          <TouchableOpacity onPress={onActionPress}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={rightIcon.onPress}
          >
            <Ionicons name={rightIcon.name} size={24} color="#000000" />
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
    borderBottomColor: '#EEEEEE',
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
    color: '#000000',
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default SectionHeader;