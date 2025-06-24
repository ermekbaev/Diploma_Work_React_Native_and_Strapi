import axios from "axios";

const API_URL = "https://exuberant-festival-9414e0f705.strapiapp.com/api";
export const IMG_API = "https://exuberant-festival-9414e0f705.strapiapp.com";

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

export const fetchModels = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/models?populate=*`);

    return response.data.data;
  } catch (error) {
    console.error("Ошибка загрузки моделей:", error);
    return [];
  }
};

export const fetchProductById = async (slug) => {
  try {
    const encodedSlug = encodeURIComponent(slug);

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
