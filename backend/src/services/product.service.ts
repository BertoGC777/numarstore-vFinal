import { dbAll, dbGet, getDatabase } from "../db";
import { resolveImageUrl } from "../utils/imageResolver";

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  isNew?: boolean;
  isSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "recent" | "asc" | "desc";
}

async function getProductExtras(productId: string, slug: string) {
  const colors = await dbAll<{ name: string; hex: string }>(
    "SELECT name, hex FROM product_colors WHERE product_id = $1 ORDER BY name",
    [productId]
  );
  const sizes = await dbAll<{ size: string }>(
    "SELECT size FROM product_sizes WHERE product_id = $1",
    [productId]
  );
  const imageRows = await dbAll<{ url: string; color: string | null }>(
    "SELECT url, color FROM product_images WHERE product_id = $1 ORDER BY sort_order",
    [productId]
  );
  const stockRows = await dbAll<{ quantity: number }>(
    "SELECT quantity FROM product_stock WHERE product_id = $1",
    [productId]
  );

  const images = imageRows.map((i) => resolveImageUrl(slug, i));
  const totalStock = stockRows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
  const hasStockConfig = stockRows.length > 0;

  return {
    colors,
    sizes: sizes.map((s) => s.size),
    images,
    totalStock,
    outOfStock: hasStockConfig && totalStock === 0,
  };
}

async function enrichProduct<T extends Record<string, unknown>>(product: T) {
  const slug = String(product.slug);
  const id = String(product.id);
  const extras = await getProductExtras(id, slug);
  return {
    ...product,
    ...extras,
    is_active: product.is_active ?? 1,
  };
}

export async function getAllProducts(filters?: ProductFilters) {
  await getDatabase();
  try {
    let query = "SELECT * FROM products WHERE (is_active = 1 OR is_active IS NULL)";
    const params: unknown[] = [];

    if (filters?.category === "lancamentos") query += " AND is_new = 1";
    else if (filters?.category === "promocao") query += " AND is_sale = 1";
    else if (filters?.category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(filters.category);
    }
    if (filters?.subcategory) {
      query += ` AND subcategory = $${params.length + 1}`;
      params.push(filters.subcategory);
    }
    if (filters?.minPrice != null) {
      query += ` AND price_pix >= $${params.length + 1}`;
      params.push(filters.minPrice);
    }
    if (filters?.maxPrice != null) {
      query += ` AND price_pix <= $${params.length + 1}`;
      params.push(filters.maxPrice);
    }
    if (filters?.search) {
      query += ` AND name ILIKE $${params.length + 1}`;
      params.push(`%${filters.search}%`);
    }
    if (filters?.sort === "asc") query += " ORDER BY price_pix ASC";
    else if (filters?.sort === "desc") query += " ORDER BY price_pix DESC";
    else query += " ORDER BY created_at DESC";

    const products = await dbAll(query, params);
    return Promise.all(products.map((p) => enrichProduct(p)));
  } catch (e: unknown) {
    const err = e as Error;
    console.error("getAllProducts error:", err.message);
    throw e;
  }
}

export async function getProductBySlug(slug: string) {
  await getDatabase();
  const product = await dbGet(
    "SELECT * FROM products WHERE slug = $1 AND (is_active = 1 OR is_active IS NULL)",
    [slug]
  );
  if (!product) return null;
  return enrichProduct(product);
}

export async function getProductById(id: string) {
  await getDatabase();
  return dbGet("SELECT * FROM products WHERE id = $1", [id]);
}

export async function getRelatedProducts(productId: string, category: string, limit = 4) {
  await getDatabase();
  const products = await dbAll(
    "SELECT * FROM products WHERE category = $1 AND id != $2 AND (is_active = 1 OR is_active IS NULL) LIMIT $3",
    [category, productId, limit]
  );
  return Promise.all(products.map((p) => enrichProduct(p)));
}

export async function searchProducts(query: string) {
  await getDatabase();
  if (!query.trim()) return [];
  const products = await dbAll(
    "SELECT * FROM products WHERE name ILIKE $1 AND (is_active = 1 OR is_active IS NULL)",
    [`%${query}%`]
  );
  return Promise.all(products.map((p) => enrichProduct(p)));
}

export async function checkStock(productId: string) {
  await getDatabase();
  const rows = await dbAll<{ quantity: number }>(
    "SELECT quantity FROM product_stock WHERE product_id = $1",
    [productId]
  );
  if (rows.length === 0) return true;
  return rows.some((r) => Number(r.quantity) > 0);
}
