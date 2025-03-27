import { useState, useEffect, useCallback } from 'react';
import { fetchCategories } from '@/services/api';
import { Category } from '@/utils/productHelpers';

/**
 * Хук для работы с категориями
 */
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка категорий
  const fetchAllCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Начальная категория "Все"
      let allCategories = [{ id: 'all', name: 'All', slug: 'all', selected: true }];
      
      const categoriesData = await fetchCategories();
      
      if (categoriesData && Array.isArray(categoriesData)) {
        // Создаем массив категорий из API
        const apiCategories = categoriesData.map((category: any) => ({
          id: category.id.toString(),
          slug: category.slug || `cat-${category.id}`,
          name: category.NameEngl || category.Name || 'Unnamed',
          selected: false
        }));
        
        // Добавляем категорию "Все" и устанавливаем ее как выбранную
        allCategories = [
          { id: 'all', name: 'All', slug: 'all', selected: true },
          ...apiCategories
        ];
      }
      
      setCategories(allCategories);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      
      // В случае ошибки устанавливаем только категорию "Все"
      setCategories([{ id: 'all', name: 'All', slug: 'all', selected: true }]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка категорий при первом рендере
  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Обновление выбранной категории
  const selectCategory = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
    
    // Обновляем состояние выбранной категории в массиве
    setCategories(prevCategories => 
      prevCategories.map(cat => ({
        ...cat,
        selected: cat.name === categoryName
      }))
    );
  }, []);

  // Обновление списка категорий
  const refreshCategories = () => {
    fetchAllCategories();
  };

  // Добавление новой категории (например, когда она обнаружена в продукте, но отсутствует в списке)
  const addCategory = useCallback((newCategory: Category) => {
    setCategories(prevCategories => {
      // Проверяем, существует ли уже такая категория
      const exists = prevCategories.some(cat => cat.id === newCategory.id || cat.slug === newCategory.slug);
      
      if (exists) {
        return prevCategories;
      }
      
      return [...prevCategories, { ...newCategory, selected: false }];
    });
  }, []);

  return {
    categories,
    selectedCategory,
    loading,
    error,
    selectCategory,
    refreshCategories,
    addCategory
  };
};

export default useCategories