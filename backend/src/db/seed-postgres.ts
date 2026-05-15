import { dbRun, dbGet, getDatabase } from "./postgres";

const COLOR_MAP: Record<string, string> = {
  amarelo: "#f5d547", azul: "#2e5cb8", branco: "#fafafa", ciano: "#5fc9d6",
  marrom: "#6b4423", preto: "#1a1a1a", rosa: "#e8a4b8", "rosa bebê": "#f5c7d4",
  verde: "#9ab87a", vermelho: "#b91c1c",
};

interface SeedProduct {
  slug: string; name: string; category: string; subcategory: string | null;
  pricePix: number; priceCard: number; desc: string;
  colors: string[]; sizes: string[];
}

const productData: SeedProduct[] = [
  { slug:"biquini-amarelo", name:"Biquíni Amarelo", category:"biquinis", subcategory:null, pricePix:45, priceCard:47.25,
    desc:"Biquíni leve e confortável em quatro cores vibrantes.", colors:["Amarelo","Azul","Ciano","Rosa Bebê"], sizes:["Único"] },
  { slug:"blusa-bella-vibe", name:"Blusa Bella Vibe", category:"partes-de-cima", subcategory:null, pricePix:50, priceCard:52.5,
    desc:"Blusa versátil perfeita para o dia a dia.", colors:["Branco","Preto","Vermelho"], sizes:["Único"] },
  { slug:"blusa-night", name:"Blusa Night", category:"partes-de-cima", subcategory:null, pricePix:45, priceCard:47.25,
    desc:"Blusa leve para looks noturnos.", colors:["Marrom","Preto"], sizes:["Único"] },
  { slug:"conjunto-cropped-saia", name:"Conjunto Cropped + Saia Longa", category:"conjuntos", subcategory:null, pricePix:120, priceCard:126,
    desc:"Conjunto sofisticado cropped + saia longa amarelo vibrante.", colors:["Amarelo"], sizes:["Único"] },
  { slug:"cropped-verao", name:"Cropped Verão", category:"partes-de-cima", subcategory:null, pricePix:45, priceCard:47.25,
    desc:"Cropped clássico de modelagem ajustada.", colors:["Branco","Preto","Amarelo"], sizes:["Único"] },
  { slug:"cropped-divine", name:"Cropped Divine Look", category:"partes-de-cima", subcategory:null, pricePix:45, priceCard:47.25,
    desc:"Cropped em três cores vibrantes.", colors:["Amarelo","Azul","Preto"], sizes:["Único"] },
  { slug:"saia-longa", name:"Saia Longa", category:"partes-de-baixo", subcategory:null, pricePix:80, priceCard:84,
    desc:"Saia longa fluida e elegante.", colors:["Preto","Branco"], sizes:["Único"] },
  { slug:"short-saia", name:"Short Saia", category:"partes-de-baixo", subcategory:null, pricePix:65, priceCard:68.25,
    desc:"Short saia versátil em três cores.", colors:["Branco","Marrom","Preto"], sizes:["Único"] },
  { slug:"saia-charme", name:"Saia Charme", category:"partes-de-baixo", subcategory:null, pricePix:65, priceCard:68.25,
    desc:"Saia Charme elegante em duas cores.", colors:["Branco","Vermelho"], sizes:["Único"] },
  { slug:"conjunto-vibe", name:"Conjunto Vibe", category:"conjuntos", subcategory:null, pricePix:110, priceCard:115.5,
    desc:"Conjunto Vibe cropped + saia sereia.", colors:["Verde","Vermelho","Branco"], sizes:["Único"] },
  { slug:"conjunto-luau", name:"Conjunto Luau", category:"conjuntos", subcategory:null, pricePix:110, priceCard:115.5,
    desc:"Conjunto Luau amarelo vibrante.", colors:["Amarelo"], sizes:["Único"] },
  { slug:"conjunto-night", name:"Conjunto Night", category:"conjuntos", subcategory:null, pricePix:110, priceCard:115.5,
    desc:"Conjunto Night saia longa fluido.", colors:["Vermelho","Branco"], sizes:["Único"] },
  { slug:"conjunto-night-curto", name:"Conjunto Night Curto", category:"conjuntos", subcategory:null, pricePix:110, priceCard:115.5,
    desc:"Conjunto Night curto. Cropped + saia mini.", colors:["Preto"], sizes:["Único"] },
  { slug:"conjunto-style", name:"Conjunto Style", category:"conjuntos", subcategory:null, pricePix:100, priceCard:105,
    desc:"Conjunto Style em três cores atemporal.", colors:["Amarelo","Preto","Rosa"], sizes:["Único"] },
  { slug:"conjunto-divine", name:"Conjunto Divine", category:"conjuntos", subcategory:null, pricePix:110, priceCard:115.5,
    desc:"Conjunto Divine amarelo. Cropped + saia.", colors:["Amarelo"], sizes:["Único"] },
  { slug:"vestido-sereia", name:"Vestido Sereia", category:"vestidos", subcategory:"vestidos-longos", pricePix:110, priceCard:115.5,
    desc:"Vestido Sereia que valoriza as curvas.", colors:["Rosa","Amarelo","Azul"], sizes:["Único"] },
  { slug:"vestido-brisa", name:"Vestido Brisa", category:"vestidos", subcategory:"vestidos-longos", pricePix:110, priceCard:115.5,
    desc:"Vestido Brisa longo e leve para eventos.", colors:["Amarelo","Rosa","Azul"], sizes:["Único"] },
  { slug:"vestido-alma", name:"Vestido Alma", category:"vestidos", subcategory:"vestidos-curtos", pricePix:90, priceCard:94.5,
    desc:"Vestido Alma justo ao corpo.", colors:["Branco","Preto","Vermelho"], sizes:["Único"] },
  { slug:"vestido-elegance", name:"Vestido Elegance", category:"vestidos", subcategory:"vestidos-curtos", pricePix:110, priceCard:115.5,
    desc:"Vestido Elegance com fenda lateral.", colors:["Preto","Branco"], sizes:["Único"] },
  { slug:"vestido-costas-nua", name:"Vestido Costas Nua", category:"vestidos", subcategory:"vestidos-longos", pricePix:110, priceCard:115.5,
    desc:"Vestido longo com decote nas costas.", colors:["Verde","Marrom"], sizes:["Único"] },
];

export async function seedAll() {
  await getDatabase();
  const count = await dbGet<{ cnt: number }>("SELECT COUNT(*) as cnt FROM products");
  if (count && count.cnt > 0) return;

  for (const p of productData) {
    const id = crypto.randomUUID();
    await dbRun(
      "INSERT INTO products (id, slug, name, description, category, subcategory, price_pix, price_card, old_price, is_new, is_sale, discount, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, 0, 0, $10)",
      [id, p.slug, p.name, p.desc, p.category, p.subcategory, p.pricePix, p.priceCard, null, Date.now()]
    );
    for (const c of p.colors) {
      const hex = COLOR_MAP[c.toLowerCase()] || "#666";
      await dbRun("INSERT INTO product_images (product_id, url, color, color_hex, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [id, `/images/${p.slug}-0.jpg`, c, hex, 0]);
      await dbRun("INSERT INTO product_colors (product_id, name, hex) VALUES ($1, $2, $3)", [id, c, hex]);
    }
    for (const s of p.sizes) {
      await dbRun("INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)", [id, s]);
    }
  }

  // Admin seed
  const bcrypt = require("bcryptjs");
  const adminId = crypto.randomUUID();
  try {
    await dbRun(
      "INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [adminId, "Admin Numar", "admin@numarstore.com", "(21) 97967-4510", bcrypt.hashSync("admin123", 10), "admin", Date.now()]
    );
    console.log("✅ Admin seedado: admin@numarstore.com / admin123");
  } catch {}
  console.log(`✅ ${productData.length} produtos seedados no PostgreSQL`);
}
