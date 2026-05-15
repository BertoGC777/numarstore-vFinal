// ===== IMAGENS REAIS DE ALTA QUALIDADE =====
import biquiniAmarelo from "@/assets/products/biquini-amarelo.jpeg";
import biquiniAzul from "@/assets/products/biquini-azul.jpeg";
import biquiniCiano from "@/assets/products/biquini-ciano.jpeg";
import biquiniRosa from "@/assets/products/biquini-rosa.jpeg";
import blusinha1Branca from "@/assets/products/blusinha1-branca.jpeg";
import blusinha1Preta from "@/assets/products/blusinha1-preta.jpeg";
import blusinha1Vermelha from "@/assets/products/blusinha1-vermelha.jpeg";
import blusinha2Marrom from "@/assets/products/blusinha2-marrom.jpeg";
import blusinha2Preta from "@/assets/products/blusinha2-preta.jpeg";
import conjunto1 from "@/assets/products/conjunto-cropped-saia-1.jpeg";
import conjunto2 from "@/assets/products/conjunto-cropped-saia-2.jpeg";
import conjunto3 from "@/assets/products/conjunto-cropped-saia-3.jpeg";
import conjunto4 from "@/assets/products/conjunto-cropped-saia-4.jpeg";
import cropped1Branco from "@/assets/products/cropped-verao-branco.jpg";
import cropped1Preto from "@/assets/products/cropped-verao-preto.jpg";
import cropped2Amarelo from "@/assets/products/cropped-verao-amarelo.jpg";
import saiaLongaBranca1 from "@/assets/products/saia-longa-branca-1.jpeg";
import saiaLongaBranca2 from "@/assets/products/saia-longa-branca-2.jpeg";
import saiaLongaPreta1 from "@/assets/products/saia-longa-preta-1.jpeg";
import saiaLongaPreta2 from "@/assets/products/saia-longa-preta-2.jpeg";
import shortSaiaBranco from "@/assets/products/short-saia-branco.jpeg";
import shortSaiaMarrom from "@/assets/products/short-saia-marrom.jpeg";
import shortSaiaPreto from "@/assets/products/short-saia-preto.jpeg";

// ===== CONJUNTOS =====
import conjVibeVerde from "@/assets/products/conjunto-vibe-verde.jpg";
import conjVibeVermelho from "@/assets/products/conjunto-vibe-vermelho.jpg";
import conjVibeBranco from "@/assets/products/conjunto-vibe-branco.jpg";
import conjLuau1 from "@/assets/products/conjunto-luau-1.jpg";
import conjLuau2 from "@/assets/products/conjunto-luau-2.jpg";
import conjNightVermelho from "@/assets/products/conjunto-night-vermelho.jpg";
import conjNightBranco from "@/assets/products/conjunto-night-branco.jpg";
import conjNightCurto from "@/assets/products/conjunto-night-curto.jpg";
import conjStyleAmarelo from "@/assets/products/conjunto-style-amarelo.jpg";
import conjStylePreto from "@/assets/products/conjunto-style-preto.jpg";
import conjStyleRosa from "@/assets/products/conjunto-style-rosa.jpg";
import conjDivine from "@/assets/products/conjunto-divine.jpg";

// ===== CROPPEDS =====
import croppedDivineAmarelo from "@/assets/products/cropped-divine-amarelo.jpg";
import croppedDivineAzul from "@/assets/products/cropped-divine-azul.jpg";
import croppedDivinePreto from "@/assets/products/cropped-divine-preto.jpg";

// ===== VESTIDOS =====
import vestSeireiaRosa1 from "@/assets/products/vestido-sereia-rosa-1.jpg";
import vestSeireiaRosa2 from "@/assets/products/vestido-sereia-rosa-2.jpg";
import vestSeireiaAmarelo1 from "@/assets/products/vestido-sereia-amarelo-1.jpg";
import vestSeireiaAmarelo2 from "@/assets/products/vestido-sereia-amarelo-2.jpg";
import vestSeireiaAzul1 from "@/assets/products/vestido-sereia-azul-1.jpg";
import vestSeireiaAzul2 from "@/assets/products/vestido-sereia-azul-2.jpg";
import vestBrisaAmarelo1 from "@/assets/products/vestido-brisa-amarelo-1.jpg";
import vestBrisaAmarelo2 from "@/assets/products/vestido-brisa-amarelo-2.jpg";
import vestBrisaRosa1 from "@/assets/products/vestido-brisa-rosa-1.jpg";
import vestBrisaRosa2 from "@/assets/products/vestido-brisa-rosa-2.jpg";
import vestBrisaAzul1 from "@/assets/products/vestido-brisa-azul-1.jpg";
import vestBrisaAzul2 from "@/assets/products/vestido-brisa-azul-2.jpg";
import vestAlmaBranco from "@/assets/products/vestido-alma-branco.jpg";
import vestAlmaPreto from "@/assets/products/vestido-alma-preto.jpg";
import vestAlmaVermelho from "@/assets/products/vestido-alma-vermelho.jpg";
import vestElegancePreto from "@/assets/products/vestido-elegance-preto.jpg";
import vestEleganceBranco from "@/assets/products/vestido-elegance-branco.jpg";
import vestCostasNuaVerde from "@/assets/products/vestido-costas-nua-verde.jpg";
import vestCostasNuaMarrom from "@/assets/products/vestido-costas-nua-marrom.jpg";

// ===== SAIAS =====
import saiaCharmeBranco from "@/assets/products/saia-charme-branco.jpg";
import saiaCharmeVermelho from "@/assets/products/saia-charme-vermelho.jpg";

export type ProductCategory =
  | "vestidos" | "biquinis" | "partes-de-cima"
  | "partes-de-baixo" | "conjuntos" | "lancamentos" | "promocao";

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string; slug: string; name: string;
  category: ProductCategory; subcategory?: string;
  pricePix: number; priceCard: number;
  oldPrice?: number; isNew?: boolean; isSale?: boolean; discount?: number;
  colors: ProductColor[]; sizes: string[];
  // images layout: [color0_img1, color1_img1, color2_img1, color0_img2, color1_img2, ...]
  // so images[colorIdx] = main photo, images[colorIdx + numColors] = hover/second photo
  images: string[]; description: string;
};

const card = (pix: number) => Math.round(pix * 1.05 * 100) / 100;

const COLOR = {
  amarelo:  { name: "Amarelo",    hex: "#f5d547" },
  azul:     { name: "Azul",       hex: "#2e5cb8" },
  branco:   { name: "Branco",     hex: "#fafafa" },
  ciano:    { name: "Ciano",      hex: "#5fc9d6" },
  marrom:   { name: "Marrom",     hex: "#6b4423" },
  preto:    { name: "Preto",      hex: "#1a1a1a" },
  rosa:     { name: "Rosa",       hex: "#e8a4b8" },
  rosaBebe: { name: "Rosa Bebê",  hex: "#f5c7d4" },
  verde:    { name: "Verde",      hex: "#9ab87a" },
  vermelho: { name: "Vermelho",   hex: "#b91c1c" },
};

export const products: Product[] = [
  // ===== BIQUÍNIS =====
  {
    id: "1", slug: "biquini", name: "Biquíni",
    category: "biquinis",
    pricePix: 45, priceCard: card(45), isNew: true,
    colors: [COLOR.amarelo, COLOR.azul, COLOR.ciano, COLOR.rosaBebe],
    sizes: ["Único"],
    // 4 cores, 1 foto cada = [amarelo, azul, ciano, rosa]
    images: [biquiniAmarelo, biquiniAzul, biquiniCiano, biquiniRosa],
    description: "Biquíni em tecido leve e macio que abraça o corpo com conforto. Quatro cores vibrantes para arrasar na praia e piscina com estilo.",
  },

  // ===== BLUSAS =====
  {
    id: "2", slug: "blusa-bella-vibe", name: "Blusa Bella Vibe",
    category: "partes-de-cima", subcategory: "Blusas",
    pricePix: 50, priceCard: card(50), isNew: true,
    colors: [COLOR.branco, COLOR.preto, COLOR.vermelho],
    sizes: ["Único"],
    // 3 cores, 1 foto cada
    images: [blusinha1Branca, blusinha1Preta, blusinha1Vermelha],
    description: "Blusa Bella Vibe em tecido fluido e confortável, perfeita para criar looks do dia a dia. Modelagem versátil que combina com tudo.",
  },
  {
    id: "3", slug: "blusa-night", name: "Blusa Night",
    category: "partes-de-cima", subcategory: "Blusas",
    pricePix: 45, priceCard: card(45), isNew: true,
    colors: [COLOR.marrom, COLOR.preto],
    sizes: ["Único"],
    images: [blusinha2Marrom, blusinha2Preta],
    description: "Blusa Night em tecido leve com toque suave, ideal para looks noturnos elegantes. Modelagem que valoriza a silhueta.",
  },

  // ===== CONJUNTO CROPPED SAIA LONGA =====
  {
    id: "4", slug: "conjunto-cropped-saia-longa", name: "Conjunto Cropped com Saia Longa",
    category: "conjuntos",
    pricePix: 120, priceCard: card(120), isNew: true,
    colors: [COLOR.amarelo],
    sizes: ["Único"],
    // 1 cor, 4 fotos = [foto1, foto2, foto3, foto4] — colorIdx=0 sempre, hover=img[0+1]=img[1]
    images: [conjunto1, conjunto2, conjunto3, conjunto4],
    description: "Conjunto sofisticado de cropped + saia longa em tecido fluido. Tom amarelo vibrante que ilumina o look e arrasta olhares.",
  },

  // ===== CROPPEDS =====
  {
    id: "5", slug: "cropped-verao", name: "Cropped Verão",
    category: "partes-de-cima", subcategory: "Croppeds",
    pricePix: 45, priceCard: card(45), isNew: true,
    colors: [COLOR.branco, COLOR.preto, COLOR.amarelo],
    sizes: ["Único"],
    // 3 cores, 1 foto cada
    images: [cropped1Branco, cropped1Preto, cropped2Amarelo],
    description: "Cropped clássico em tecido elástico e confortável, modelagem ajustada que valoriza. Base perfeita para combinar com saias e calças.",
  },
  {
    id: "6", slug: "cropped-divine-look", name: "Cropped Divine Look",
    category: "partes-de-cima", subcategory: "Croppeds",
    pricePix: 45, priceCard: card(45), isNew: true,
    colors: [COLOR.amarelo, COLOR.azul, COLOR.preto],
    sizes: ["Único"],
    images: [croppedDivineAmarelo, croppedDivineAzul, croppedDivinePreto],
    description: "Cropped Divine Look em tecido leve com caimento perfeito. Três cores vibrantes para uma peça versátil e cheia de personalidade.",
  },

  // ===== SAIAS =====
  {
    id: "7", slug: "saia-longa", name: "Saia Longa",
    category: "partes-de-baixo", subcategory: "Saias",
    pricePix: 80, priceCard: card(80), isNew: true,
    colors: [COLOR.preto, COLOR.branco],
    sizes: ["Único"],
    // 2 cores, 2 fotos cada = [preta1, branca1, preta2, branca2]
    images: [saiaLongaPreta1, saiaLongaBranca1, saiaLongaPreta2, saiaLongaBranca2],
    description: "Saia longa em tecido fluido com caimento elegante e movimento. Disponível em preto e branco para looks sofisticados.",
  },
  {
    id: "8", slug: "short-saia", name: "Short Saia",
    category: "partes-de-baixo", subcategory: "Shorts",
    pricePix: 65, priceCard: card(65), isNew: true,
    colors: [COLOR.branco, COLOR.marrom, COLOR.preto],
    sizes: ["Único"],
    images: [shortSaiaBranco, shortSaiaMarrom, shortSaiaPreto],
    description: "Short saia em tecido confortável e modelagem que valoriza. Três cores essenciais para criar looks versáteis do dia a dia.",
  },
  {
    id: "9", slug: "saia-charme", name: "Saia Charme",
    category: "partes-de-baixo", subcategory: "Saias",
    pricePix: 65, priceCard: card(65), isNew: true,
    colors: [COLOR.branco, COLOR.vermelho],
    sizes: ["Único"],
    images: [saiaCharmeBranco, saiaCharmeVermelho],
    description: "Saia Charme em tecido com toque suave e modelagem elegante. Duas opções de cor para looks femininos e modernos.",
  },

  // ===== CONJUNTOS =====
  {
    id: "10", slug: "conjunto-vibe", name: "Conjunto Vibe",
    category: "conjuntos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.verde, COLOR.vermelho, COLOR.branco],
    sizes: ["Único"],
    images: [conjVibeVerde, conjVibeVermelho, conjVibeBranco],
    description: "Conjunto Vibe com cropped + saia longa sereia em tecido fluido. Disponível em verde, vermelho e branco para looks românticos.",
  },
  {
    id: "11", slug: "conjunto-luau", name: "Conjunto Luau",
    category: "conjuntos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.amarelo],
    sizes: ["Único"],
    // 1 cor, 2 fotos = [foto1, foto2] — hover = img[0+1] = img[1]
    images: [conjLuau1, conjLuau2],
    description: "Conjunto Luau em amarelo vibrante com tecido leve e fresco. Cropped + saia longa para um look verão cheio de energia.",
  },
  {
    id: "12", slug: "conjunto-night", name: "Conjunto Night",
    category: "conjuntos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.vermelho, COLOR.branco],
    sizes: ["Único"],
    images: [conjNightVermelho, conjNightBranco],
    description: "Conjunto Night com saia longa em tecido fluido e elegante. Modelagem que cria um look sofisticado e feminino.",
  },
  {
    id: "13", slug: "conjunto-night-curto", name: "Conjunto Night Curto",
    category: "conjuntos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.preto],
    sizes: ["Único"],
    images: [conjNightCurto],
    description: "Conjunto Night versão curta em tecido confortável. Cropped + saia mini para um look ousado e cheio de atitude.",
  },
  {
    id: "14", slug: "conjunto-style", name: "Conjunto Style",
    category: "conjuntos",
    pricePix: 100, priceCard: card(100), isNew: true,
    colors: [COLOR.amarelo, COLOR.preto, COLOR.rosa],
    sizes: ["Único"],
    images: [conjStyleAmarelo, conjStylePreto, conjStyleRosa],
    description: "Conjunto Style em tecido leve com modelagem atemporal. Três cores para uma combinação elegante que nunca sai de moda.",
  },
  {
    id: "15", slug: "conjunto-divine", name: "Conjunto Divine",
    category: "conjuntos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.amarelo],
    sizes: ["Único"],
    images: [conjDivine],
    description: "Conjunto Divine em amarelo vibrante com tecido fresco. Cropped + saia para um look fresh e cheio de estilo.",
  },

  // ===== VESTIDOS =====
  {
    id: "16", slug: "vestido-sereia", name: "Vestido Sereia",
    category: "vestidos", subcategory: "Vestidos Longos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.rosa, COLOR.amarelo, COLOR.azul],
    sizes: ["Único"],
    // 3 cores, 2 fotos cada = [rosa1, amarelo1, azul1, rosa2, amarelo2, azul2]
    images: [vestSeireiaRosa1, vestSeireiaAmarelo1, vestSeireiaAzul1, vestSeireiaRosa2, vestSeireiaAmarelo2, vestSeireiaAzul2],
    description: "Vestido Sereia em tecido com caimento que valoriza as curvas. Disponível em rosa, amarelo e azul para arrasar em qualquer evento.",
  },
  {
    id: "17", slug: "vestido-brisa", name: "Vestido Brisa",
    category: "vestidos", subcategory: "Vestidos Longos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.amarelo, COLOR.rosa, COLOR.azul],
    sizes: ["Único"],
    // 3 cores, 2 fotos cada = [amarelo1, rosa1, azul1, amarelo2, rosa2, azul2]
    images: [vestBrisaAmarelo1, vestBrisaRosa1, vestBrisaAzul1, vestBrisaAmarelo2, vestBrisaRosa2, vestBrisaAzul2],
    description: "Vestido Brisa longo em tecido leve e fluido. Perfeito para eventos especiais com elegância e conforto.",
  },
  {
    id: "18", slug: "vestido-alma", name: "Vestido Alma",
    category: "vestidos", subcategory: "Vestidos Curtos",
    pricePix: 90, priceCard: card(90), isNew: true,
    colors: [COLOR.branco, COLOR.preto, COLOR.vermelho],
    sizes: ["Único"],
    images: [vestAlmaBranco, vestAlmaPreto, vestAlmaVermelho],
    description: "Vestido Alma em tecido elástico com modelagem justa ao corpo. Três cores para looks modernos e cheios de atitude.",
  },
  {
    id: "19", slug: "vestido-elegance", name: "Vestido Elegance",
    category: "vestidos", subcategory: "Vestidos Curtos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.preto, COLOR.branco],
    sizes: ["Único"],
    images: [vestElegancePreto, vestEleganceBranco],
    description: "Vestido Elegance em tecido com toque sofisticado e fenda lateral. Sofisticação para qualquer ocasião especial.",
  },
  {
    id: "20", slug: "vestido-costas-nua", name: "Vestido Costas Nua",
    category: "vestidos", subcategory: "Vestidos Longos",
    pricePix: 110, priceCard: card(110), isNew: true,
    colors: [COLOR.verde, COLOR.marrom],
    sizes: ["Único"],
    images: [vestCostasNuaVerde, vestCostasNuaMarrom],
    description: "Vestido longo em tecido fluido com decote nas costas. Caimento elegante para um look feminino e surpreendente.",
  },
];

export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug);
export const getProductsByCategory = (cat?: string) =>
  cat && cat !== "todos"
    ? products.filter(
        (p) => p.category === cat ||
          (cat === "lancamentos" && p.isNew) ||
          (cat === "promocao" && p.isSale)
      )
    : products;
export const getFeatured = (n = 8) => [...products].sort(() => Math.random() - 0.5).slice(0, n);
export const getRelated = (id: string, n = 4) =>
  products.filter((p) => p.id !== id).slice(0, n);
export const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
