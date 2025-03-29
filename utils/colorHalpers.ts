export type Product = {
    id?: number;
    slug: string;
    Name: string;
    Description?: string;
    Price?: number;
    brandName?: string;
    imageUrl?: string;
    // Поле colors должно соответствовать реальной структуре
    colors?: Array<{ id: number, Name: string, colorCode?: string }>;
    // Другие поля, которые могут быть у вашего продукта
  };
  
  /**
   * Определяет цвет фона для продукта на основе различных данных
   */
  export const getProductBackgroundColor = (
    product: Product,
    selectedColorName?: string,
    selectedColorCode?: string
  ): string => {
    // 1. Если выбран конкретный цвет, используем его в первую очередь
    if (selectedColorCode) {
      return selectedColorCode;
    }
    
    // 2. Если указано название цвета, пытаемся определить его
    if (selectedColorName) {
      const colorLower = selectedColorName.toLowerCase();
      
      // Карта цветов
      const colorMap: Record<string, string> = {
        'green': '#7CFC00',
        'зеленый': '#7CFC00',
        'blue': '#0000FF',
        'синий': '#0000FF',
        'red': '#FF0000',
        'красный': '#FF0000',
        'white': '#F0F0F0',
        'белый': '#F0F0F0',
        'black': '#333333',
        'черный': '#333333',
        'yellow': '#FFEB3B',
        'желтый': '#FFEB3B',
        'pink': '#FF80AB',
        'розовый': '#FF80AB',
        'orange': '#FF9800',
        'оранжевый': '#FF9800',
        'purple': '#9C27B0',
        'фиолетовый': '#9C27B0',
        'grey': '#9E9E9E',
        'серый': '#9E9E9E',
        'brown': '#795548',
        'коричневый': '#795548',
        // Добавьте другие цвета по необходимости
      };
      
      // Проверяем каждый цвет
      for (const colorKey in colorMap) {
        if (colorLower.includes(colorKey)) {
          return colorMap[colorKey];
        }
      }
    }
    
    // 3. Ищем указание на цвет в названии продукта
    const productName = product.Name.toLowerCase();
    const colorTerms = [
      { term: 'green', color: '#7CFC00' },
      { term: 'blue', color: '#0000FF' },
      { term: 'red', color: '#FF0000' },
      { term: 'white', color: '#F0F0F0' },
      { term: 'black', color: '#333333' },
      { term: 'yellow', color: '#FFEB3B' },
      { term: 'pink', color: '#FF80AB' },
      { term: 'orange', color: '#FF9800' },
      { term: 'purple', color: '#9C27B0' },
      { term: 'grey', color: '#9E9E9E' },
      { term: 'brown', color: '#795548' },
      // Добавьте другие цвета по необходимости
    ];
    
    for (const { term, color } of colorTerms) {
      if (productName.includes(term)) {
        return color;
      }
    }
    
    // 4. Если название продукта содержит конкретную модель с известным цветом
    const modelColorMap: Record<string, string> = {
    };
    
    for (const model in modelColorMap) {
      if (productName.includes(model)) {
        return modelColorMap[model];
      }
    }
    
    // 5. Цвет по умолчанию
    return '#F5F5F5';
  };
  
  /**
   * Преобразует HEX-код цвета в RGBA строку
   */
  export const hexToRgba = (hex: string, alpha = 1): string => {
    // Проверяем наличие hex значения
    if (!hex) return `rgba(240, 240, 240, ${alpha})`;
    
    // Удаляем # из начала, если есть
    hex = hex.replace('#', '');
    
    // Преобразуем 3-значный hex в 6-значный
    const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
    // Проверяем корректность hex
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      return `rgba(240, 240, 240, ${alpha})`;
    }
    
    // Парсим RGB значения
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };