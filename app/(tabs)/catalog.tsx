// app/tabs/catalog.tsx
import { View, Text } from 'react-native';

export default function CatalogScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Каталог товаров</Text>
      {/* Здесь разместите компоненты для фильтрации и список товаров */}
    </View>
  );
}
