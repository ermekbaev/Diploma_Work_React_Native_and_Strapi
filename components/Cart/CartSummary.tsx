import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ 
  subtotal, 
  shipping, 
  total,
  itemCount 
}) => {
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
    <View style={styles.summaryContainer}>
      {/* Информация о количестве товаров */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          {itemCount} {getPluralForm(itemCount, ['товар', 'товара', 'товаров'])}
        </Text>
        <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
      </View>
      
      {/* Информация о доставке */}
      <View style={styles.summaryRow}>
        <View style={styles.shippingLabelContainer}>
          <Text style={styles.summaryLabel}>Доставка</Text>
          {shipping === 0 && (
            <Text style={styles.freeShippingLabel}>Бесплатно</Text>
          )}
        </View>
        <Text style={styles.summaryValue}>
          {shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}
        </Text>
      </View>
      
      {/* Скидки (если они есть) */}
      {/* <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Скидка</Text>
        <Text style={[styles.summaryValue, styles.discountValue]}>
          - {formatPrice(0)}
        </Text>
      </View> */}
      
      {/* Итого */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 15,
    backgroundColor: '#F9F9F9',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
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
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: '500',
    fontSize: 14,
    color: '#333',
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
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 18,
    color: '#000',
  },
});

export default CartSummary;