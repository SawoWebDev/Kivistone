import productsData from './products.json';

export const productsByCategory = productsData;

export const getProductsForCategory = (categorySlug) => productsData[categorySlug] || [];

export const getProduct = (categorySlug, productId) =>
  getProductsForCategory(categorySlug).find((p) => p.id === productId);
