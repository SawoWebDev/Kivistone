/*
  One entry per product range. `feature: true` promotes a range into the two
  large spotlight cards at the top of the products grid.

  Data now lives in categories.json, which is overwritten at build time by
  the sync-cms-data script from the D1 database (see src/data/products.js
  for the identical pattern already in place for products).
*/
import categoriesData from './categories.json';

export const categories = categoriesData;

export const getCategory = (slug) => categories.find((c) => c.slug === slug);

export const featuredCategories = categories.filter((c) => c.feature);
export const standardCategories = categories.filter((c) => !c.feature);
