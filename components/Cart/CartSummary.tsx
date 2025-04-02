import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  isDark?: boolean;
  colors?: any;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  subtotal, 
  shipping, 
  total,
  itemCount,
  isDark: propIsDark,
  colors: propColors
}) => {
  // Получаем данные темы из контекста, если они не переданы через пропсы
  const { theme, colors: themeColors } = useAppTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const colors = propColors || themeColors;

  // Функция для форматирования цены
  const formatPrice = (price: number): string => {
    return price.toFixed(2) + ' ₽';
  };

  // Вспомогательная функция для получения правильной формы слова в зависимости от числа
  const getPluralForm = (count: number, forms: [string, string, string]): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    const index = (count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)];
    return forms[index];
  };

  return (
    <View style={[
      styles.summaryContainer, 
      { 
        backgroundColor: isDark ? colors.cardBackground : '#F9F9F9',
        borderColor: colors.border
      }
    ]}>
      {/* Информация о количестве товаров */}
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.placeholder }]}>
          {itemCount} {getPluralForm(itemCount, ['товар', 'товара', 'товаров'])}
        </Text>
        <Text style={[styles.summaryValue, { color: colors.text }]}>
          {formatPrice(subtotal)}
        </Text>
      </View>
      
      {/* Информация о доставке */}
      <View style={styles.summaryRow}>
        <View style={styles.shippingLabelContainer}>
          <Text style={[styles.summaryLabel, { color: colors.placeholder }]}>Доставка</Text>
          {shipping === 0 && (
            <Text style={[
              styles.freeShippingLabel, 
              { 
                color: isDark ? '#2E7D32' : '#4CAF50',
                backgroundColor: isDark ? '#1B3B1F' : '#E8F5E9' 
              }
            ]}>
              Бесплатно
            </Text>
          )}
        </View>
        <Text style={[styles.summaryValue, { color: colors.text }]}>
          {shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}
        </Text>
      </View>
      
      {/* Итого */}
      <View style={[
        styles.totalRow, 
        { borderTopColor: colors.border }
      ]}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Итого</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {formatPrice(total)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shippingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeShippingLabel: {
    marginLeft: 8,
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: '500',
    fontSize: 14,
  },
  discountValue: {
    color: '#4CAF50',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 18,
  },
});

export default CartSummary;