import { dbRun, dbAll, dbGet } from "./sqlite";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  subcategory: string | null;
  price_pix: number;
  price_card: number;
  old_price: number | null;
  is_new: number;
  is_sale: number;
  discount: number;
}

interface ProductWithDetails extends ProductRow {
  images: { url: string; color: string; color_hex: string | null }[];
  colors: { name: string; hex: string }[];
  sizes: string[];
}

export function getAllProducts(filters?: {
  category?: string;
  subcategory?: string;
  isNew?: boolean;
  isSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "recent" | "asc" | "desc";
}) {
  let query = "SELECT * FROM products WHERE 1=1";
  const params: any[] = [];

  if (filters?.category === "lancamentos") {
    query += " AND is_new = 1";
  } else if (filters?.category === "promocao") {
    query += " AND is_sale = 1";
  } else if (filters?.category) {
    query += " AND category = ?";
    params.push(filters.category);
  }

  if (filters?.subcategory) {
    query += " AND subcategory = ?";
    params.push(filters.subcategory);
  }
  if (filters?.minPrice != null) {
    query += " AND price_pix >= ?";
    params.push(filters.minPrice);
  }
  if (filters?.maxPrice != null) {
    query += " AND price_pix <= ?";
    params.push(filters.maxPrice);
  }
  if (filters?.search) {
    query += " AND name LIKE ?";
    params.push(`%${filters.search}%`);
  }

  if (filters?.sort === "asc") query += " ORDER BY price_pix ASC";
  else if (filters?.sort === "desc") query += " ORDER BY price_pix DESC";
  else query += " ORDER BY created_at DESC";

  const rows = dbAll(query, params) as ProductRow[];

  return rows.map((row) => ({
    ...row,
    images: getProductImages(row.id),
    colors: getProductColors(row.id),
    sizes: getProductSizes(row.id),
  }));
}

export function getProductBySlug(slug: string): ProductWithDetails | null {
  const row = dbGet<ProductRow>("SELECT * FROM products WHERE slug = ?", [slug]);
  if (!row) return null;
  return {
    ...row,
    images: getProductImages(row.id),
    colors: getProductColors(row.id),
    sizes: getProductSizes(row.id),
  };
}

export function getProductById(id: string): ProductWithDetails | null {
  const row = dbGet<ProductRow>("SELECT * FROM products WHERE id = ?", [id]);
  if (!row) return null;
  return {
    ...row,
    images: getProductImages(row.id),
    colors: getProductColors(row.id),
    sizes: getProductSizes(row.id),
  };
}

export function getRelatedProducts(productId: string, category: string, limit = 4) {
  const rows = dbAll<ProductRow>("SELECT * FROM products WHERE category = ? AND id != ? LIMIT ?", [category, productId, limit]);
  return rows.map((row) => ({
    ...row,
    images: getProductImages(row.id),
    colors: getProductColors(row.id),
    sizes: getProductSizes(row.id),
  }));
}

export function searchProducts(query: string) {
  if (!query.trim()) return [];
  const rows = dbAll<ProductRow>("SELECT * FROM products WHERE name LIKE ?", [`%${query}%`]);
  return rows.map((row) => ({
    ...row,
    images: getProductImages(row.id),
    colors: getProductColors(row.id),
    sizes: getProductSizes(row.id),
  }));
}

export function checkStock(productId: string) {
  const row = dbGet<{ cnt: number }>("SELECT COUNT(*) as cnt FROM product_images WHERE product_id = ?", [productId]);
  return row ? row.cnt > 0 : false;
}

function getProductImages(productId: string) {
  return dbAll<{ url: string; color: string; color_hex: string | null }>("SELECT url, color, color_hex FROM product_images WHERE product_id = ? ORDER BY sort_order", [productId]);
}

function getProductColors(productId: string) {
  return dbAll<{ name: string; hex: string }>("SELECT name, hex FROM product_colors WHERE product_id = ?", [productId]);
}

function getProductSizes(productId: string) {
  const rows = dbAll<{ size: string }>("SELECT size FROM product_sizes WHERE product_id = ?", [productId]);
  return rows.map((r) => r.size);
}