import axios from "axios";

// Укажи URL своего Strapi-сервера (если локально, то замени на свой IP)
const API_URL = "http://192.168.0.103:1337/api";
// const API_URL = "http://localhost:1337/api";

/**
 * Получение списка товаров с полной информацией
 */
export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products?populate=*`);
    return response.data.data; // Strapi возвращает данные в поле `data`
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories?populate=*`);
    return response.data.data; // Strapi возвращает данные в поле `data`
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    return [];
  }
};

/**
 * Получение моделей с полной информацией
 */
export const fetchModels = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/models?populate=*`);

    return response.data.data;
  } catch (error) {
    console.error("Ошибка загрузки моделей:", error);
    return [];
  }
};

/**
 * Получение информации о конкретном товаре по ID
 */
// Добавьте эту новую функцию для получения отдельного товара по ID/slug
export const fetchProductById = async (slug) => {
  try {
    // Кодируем slug для безопасного использования в URL
    const encodedSlug = encodeURIComponent(slug);

    // Используем закодированный slug в URL
    const response = await fetch(
      `${API_URL}/products?filters[slug][$eq]=${slug}&populate=*`
    );

    if (!response.ok) {
      throw new Error("Не удалось получить данные о товаре");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при получении товара:", error);
    throw error;
  }
};

export const fetchModelsByProductId = async (productId) => {
  try {
    const response = await fetch(
      `${API_URL}/models?filters[product][id][$eq]=${productId}&populate=*`
    );

    if (!response.ok) {
      throw new Error("Не удалось загрузить модели");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Ошибка при загрузке моделей:", error);
    return [];
  }
};
