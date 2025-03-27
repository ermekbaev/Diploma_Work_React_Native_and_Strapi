import { IMG_API } from "../services/api";

export const getFullImageUrl = (
  relativePath,
  defaultImage = "https://placehold.co/150x105/3E4246/FFFFFF?text=No+image"
) => {
  if (!relativePath) return defaultImage;

  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://")
  ) {
    return relativePath;
  }

  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${IMG_API}${path}`;
};

export const extractImagesFromModels = (models, productSlug) => {
  if (!models || !Array.isArray(models) || models.length === 0) {
    return ["https://placehold.co/150x105/3E4246/FFFFFF?text=No+image"];
  }

  // Фильтруем модели, соответствующие продукту
  const matchingModels = models.filter(
    (model) => model.product?.slug === productSlug
  );

  if (matchingModels.length === 0) {
    return ["https://placehold.co/150x105/3E4246/FFFFFF?text=No+image"];
  }

  // Извлекаем URL-ы изображений из моделей
  const imageUrls = [];

  matchingModels.forEach((model) => {
    if (model.images && model.images.length > 0) {
      model.images.forEach((image) => {
        let imageUrl = null;

        if (image.url) {
          imageUrl = getFullImageUrl(image.url);
        } else if (
          image.formats &&
          image.formats.small &&
          image.formats.small.url
        ) {
          imageUrl = getFullImageUrl(image.formats.small.url);
        }

        if (imageUrl && !imageUrls.includes(imageUrl)) {
          imageUrls.push(imageUrl);
        }
      });
    }
  });

  return imageUrls.length > 0
    ? imageUrls
    : ["https://placehold.co/150x105/3E4246/FFFFFF?text=No+image"];
};
