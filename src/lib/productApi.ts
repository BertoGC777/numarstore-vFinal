import { api } from "@/api/client";
import {
  products as localProducts,
  type Product,
  type ProductCategory,
} from "@/data/products";

export function mapApiProduct(raw: Record<string, unknown>): Product {
  const imagesRaw = raw.images as unknown;
  let images: string[] = [];
  if (Array.isArray(imagesRaw)) {
    images = imagesRaw.map((img) =>
      typeof img === "string" ? img : String((img as { url?: string })?.url || "")
    );
  }

  const colorsRaw = (raw.colors as { name: string; hex: string }[]) || [];

  return {
    id: String(raw.id),
    slug: String(raw.slug),
    name: String(raw.name),
    category: String(raw.category || "conjuntos") as ProductCategory,
    subcategory: raw.subcategory ? String(raw.subcategory) : undefined,
    pricePix: Number(raw.price_pix ?? raw.pricePix ?? 0),
    priceCard: Number(raw.price_card ?? raw.priceCard ?? 0),
    oldPrice: raw.old_price != null ? Number(raw.old_price) : undefined,
    isNew: !!(raw.is_new ?? raw.isNew),
    isSale: !!(raw.is_sale ?? raw.isSale),
    discount: Number(raw.discount ?? 0),
    colors: colorsRaw.length
      ? colorsRaw
      : [{ name: "Único", hex: "#666666" }],
    sizes: (raw.sizes as string[])?.length
      ? (raw.sizes as string[])
      : ["Único"],
    images: images.length ? images : ["/placeholder.jpg"],
    description: String(raw.description || ""),
    outOfStock: !!(raw.outOfStock),
  };
}

export async function fetchAllProducts(params?: Record<string, string>): Promise<Product[]> {
  try {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const data = await api.get(`/products${qs}`);
    const list = Array.isArray(data) ? data : [];
    return list.map((p) => mapApiProduct(p));
  } catch (e) {
    console.warn("[productApi] API indisponível, usando catálogo local:", e);
    return localProducts;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const data = await api.get(`/products/${slug}`);
    return mapApiProduct(data);
  } catch {
    return localProducts.find((p) => p.slug === slug) || null;
  }
}

export async function fetchRelatedProducts(slug: string): Promise<Product[]> {
  try {
    const data = await api.get(`/products/${slug}/related`);
    return (Array.isArray(data) ? data : []).map((p) => mapApiProduct(p));
  } catch {
    const local = localProducts.find((p) => p.slug === slug);
    if (!local) return [];
    return localProducts.filter((p) => p.id !== local.id).slice(0, 4);
  }
}

export async function fetchFeatured(count = 8): Promise<Product[]> {
  const all = await fetchAllProducts();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getLocalProducts(): Product[] {
  return localProducts;
}
