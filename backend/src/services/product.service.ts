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

async function getResolvedImageUrls(productId: string, slug: string): Promise<string[]> {
  const images = await dbAll(
    "SELECT url, color FROM product_images WHERE product_id = $1 ORDER BY sort_order",
    [productId]
  );
  return images.map((i: { url: string; color?: string | null }) =>
    resolveImageUrl(slug, i)
  );
}

export async function getAllProducts(filters?: ProductFilters) {
   await getDatabase();
   try {
     let query = "SELECT * FROM products WHERE 1=1";
     const params: any[] = [];

     if (filters?.category === "lancamentos") query += " AND is_new = 1";
     else if (filters?.category === "promocao") query += " AND is_sale = 1";
     else if (filters?.category) { query += " AND category = $" + (params.length + 1); params.push(filters.category); }
     if (filters?.subcategory) { query += " AND subcategory = $" + (params.length + 1); params.push(filters.subcategory); }
     if (filters?.minPrice != null) { query += " AND price_pix >= $" + (params.length + 1); params.push(filters.minPrice); }
     if (filters?.maxPrice != null) { query += " AND price_pix <= $" + (params.length + 1); params.push(filters.maxPrice); }
     if (filters?.search) { query += " AND name LIKE $" + (params.length + 1); params.push(`%${filters.search}%`); }
     if (filters?.sort === "asc") query += " ORDER BY price_pix ASC";
     else if (filters?.sort === "desc") query += " ORDER BY price_pix DESC";
     else query += " ORDER BY created_at DESC";

     const products = await dbAll(query, params);

     const productsWithImages = await Promise.all(
       products.map(async (p: { id: string; slug: string }) => ({
         ...p,
         images: await getResolvedImageUrls(p.id, p.slug),
       }))
     );

     return productsWithImages;
   } catch (e: any) {
     console.error("getAllProducts error:", e.message);
     throw e;
   }
 }

export async function getProductBySlug(slug: string) {
  await getDatabase();
  const product = await dbGet("SELECT * FROM products WHERE slug = $1", [slug]);
  if (!product) return null;

  return {
    ...product,
    images: await getResolvedImageUrls(product.id, product.slug),
  };
}

export async function getProductById(id: string) {
  await getDatabase();
  return dbGet("SELECT * FROM products WHERE id = $1", [id]);
}

export async function getRelatedProducts(productId: string, category: string, limit = 4) {
  await getDatabase();
  const products = await dbAll("SELECT * FROM products WHERE category = $1 AND id != $2 LIMIT $3", [category, productId, limit]);

  return Promise.all(
    products.map(async (p: { id: string; slug: string }) => ({
      ...p,
      images: await getResolvedImageUrls(p.id, p.slug),
    }))
  );
}

export async function searchProducts(query: string) {
  await getDatabase();
  if (!query.trim()) return [];
  const products = await dbAll("SELECT * FROM products WHERE name LIKE $1", [`%${query}%`]);

  return Promise.all(
    products.map(async (p: { id: string; slug: string }) => ({
      ...p,
      images: await getResolvedImageUrls(p.id, p.slug),
    }))
  );
}

export async function checkStock(productId: string) {
  await getDatabase();
  const r = dbGet<{ cnt: number }>("SELECT COUNT(*) as cnt FROM orders", []);
  return true;
}
