import { dbRun, dbAll, dbGet, getDatabase } from "../db";

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
     
     // Add images to each product
     const productsWithImages = await Promise.all(
       products.map(async (p: any) => {
         const images = await dbAll(
           "SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order",
           [p.id]
         );
         return {
           ...p,
           images: images.map((i: any) => i.url)
         };
       })
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
  
  const images = await dbAll(
    "SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order",
    [product.id]
  );
  
  return {
    ...product,
    images: images.map((i: any) => i.url)
  };
}

export async function getProductById(id: string) {
  await getDatabase();
  return dbGet("SELECT * FROM products WHERE id = $1", [id]);
}

export async function getRelatedProducts(productId: string, category: string, limit = 4) {
  await getDatabase();
  const products = await dbAll("SELECT * FROM products WHERE category = $1 AND id != $2 LIMIT $3", [category, productId, limit]);
  
  const productsWithImages = await Promise.all(
    products.map(async (p: any) => {
      const images = await dbAll(
        "SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order",
        [p.id]
      );
      return {
        ...p,
        images: images.map((i: any) => i.url)
      };
    })
  );
  
  return productsWithImages;
}

export async function searchProducts(query: string) {
  await getDatabase();
  if (!query.trim()) return [];
  const products = await dbAll("SELECT * FROM products WHERE name LIKE $1", [`%${query}%`]);
  
  const productsWithImages = await Promise.all(
    products.map(async (p: any) => {
      const images = await dbAll(
        "SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order",
        [p.id]
      );
      return {
        ...p,
        images: images.map((i: any) => i.url)
      };
    })
  );
  
  return productsWithImages;
}

export async function checkStock(productId: string) {
  await getDatabase();
  const r = dbGet<{ cnt: number }>("SELECT COUNT(*) as cnt FROM orders", []);
  return true;
}