import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SortOption {
  id: string;
  title: string;
  icon?: string;
}

interface SortModalProps {
  visible: boolean;
  selectedOption: string;
  onSelect: (option: string) => void;
  onClose: () => void;
}

const sortOptions: SortOption[] = [
  { id: 'popular', title: 'По популярности', icon: 'star' },
  { id: 'price_asc', title: 'Цена: от низкой к высокой', icon: 'arrow-up' },
  { id: 'price_desc', title: 'Цена: от высокой к низкой', icon: 'arrow-down' },
  { id: 'name_asc', title: 'По названию (A-Z)', icon: 'text' },
  { id: 'name_desc', title: 'По названию (Z-A)', icon: 'text' },
];

const SortModal: React.FC<SortModalProps> = ({
  visible,
  selectedOption,
  onSelect,
  onClose
}) => {
  // Рендеринг элемента списка сортировки
  const renderSortOption = ({ item }: { item: SortOption }) => {
    const isSelected = selectedOption === item.id;
    
    return (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => {
          onSelect(item.id);
        }}
      >
        <View style={styles.optionContent}>
          {item.icon && (
            <Ionicons
              name={
                item.id === 'price_asc' 
                  ? 'arrow-up' 
                  : item.id === 'price_desc' 
                    ? 'arrow-down' 
                    : item.id === 'popular' 
                      ? 'star' 
                      : 'text'
              }
              size={18}
              color={isSelected ? '#000' : '#666'}
              style={styles.optionIcon}
            />
          )}
          <Text
            style={[
              styles.optionText,
              isSelected && styles.selectedOptionText
            ]}
          >
            {item.title}
          </Text>
        </View>
        
        {isSelected && (
          <Ionicons name="checkmark" size={20} color="#000" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Сортировка</Text>
            <View style={styles.placeholder} />
          </View>
          
          <FlatList
            data={sortOptions}
            renderItem={renderSortOption}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={onClose}
            >
              <Text style={styles.applyButtonText}>Готово</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32, // Для баланса заголовка
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#000',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
});

export default SortModal;