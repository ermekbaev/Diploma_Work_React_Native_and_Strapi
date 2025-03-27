import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, shipping, total }) => {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Сумма товаров</Text>
        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Доставка</Text>
        <Text style={styles.summaryValue}>${shipping.toFixed(2)}</Text>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Итого</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginTop: 15,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#666',
    fontSize: 14,
  },
  summaryValue: {
    fontWeight: '500',
    fontSize: 14,
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
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 18,
  },
});

export default CartSummary;