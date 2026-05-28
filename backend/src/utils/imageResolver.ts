import fs from "fs";
import path from "path";

const BACKEND_URL = process.env.BACKEND_URL || "https://numarstore-backend.onrender.com";

/** slug → cor → arquivo em public/images */
export const PRODUCT_IMAGE_MAP: Record<string, Record<string, string>> = {
  "biquini-amarelo": {
    Amarelo: "biquini-amarelo.jpeg",
    Azul: "biquini-azul.jpeg",
    Ciano: "biquini-ciano.jpeg",
    "Rosa Bebê": "biquini-rosa.jpeg",
  },
  "blusa-bella-vibe": {
    Branco: "bella-vibe-branco.jpg",
    Preto: "bella-vibe-preto.jpg",
    Vermelho: "bella-vibe-vermelho.jpg",
  },
  "blusa-night": {
    Marrom: "blusa-night-marrom.jpg",
    Preto: "blusa-night-preta.jpg",
  },
  "conjunto-cropped-saia": {
    Amarelo: "conjunto-cropped-saia-1.jpeg",
  },
  "cropped-verao": {
    Branco: "cropped-verao-branco.jpg",
    Preto: "cropped-verao-preto.jpg",
    Amarelo: "cropped-verao-amarelo.jpg",
  },
  "cropped-divine": {
    Amarelo: "cropped-divine-amarelo.jpg",
    Azul: "cropped-divine-azul.jpg",
    Preto: "cropped-divine-preto.jpg",
  },
  "saia-longa": {
    Preto: "saia-longa-preta-1.jpeg",
    Branco: "saia-longa-branca-1.jpeg",
  },
  "short-saia": {
    Branco: "short-saia-branco.jpeg",
    Marrom: "short-saia-marrom.jpeg",
    Preto: "short-saia-preto.jpeg",
  },
  "saia-charme": {
    Branco: "saia-charme-branco.jpg",
    Vermelho: "saia-charme-vermelho.jpg",
  },
  "conjunto-vibe": {
    Verde: "conjunto-vibe-verde.jpg",
    Vermelho: "conjunto-vibe-vermelho.jpg",
    Branco: "conjunto-vibe-branco.jpg",
  },
  "conjunto-luau": {
    Amarelo: "conjunto-luau-1.jpg",
  },
  "conjunto-night": {
    Vermelho: "conjunto-night-vermelho.jpg",
    Branco: "conjunto-night-branco.jpg",
  },
  "conjunto-night-curto": {
    Preto: "conjunto-night-curto.jpg",
  },
  "conjunto-style": {
    Amarelo: "conjunto-style-amarelo.jpg",
    Preto: "conjunto-style-preto.jpg",
    Rosa: "conjunto-style-rosa.jpg",
  },
  "conjunto-divine": {
    Amarelo: "conjunto-divine-amarelo.jpg",
  },
  "vestido-sereia": {
    Rosa: "vestido-sereia-rosa-1.jpg",
    Amarelo: "vestido-sereia-amarelo-1.jpg",
    Azul: "vestido-sereia-azul-1.jpg",
  },
  "vestido-brisa": {
    Amarelo: "vestido-brisa-amarelo-1.jpg",
    Rosa: "vestido-brisa-rosa-1.jpg",
    Azul: "vestido-brisa-azul-1.jpg",
  },
  "vestido-alma": {
    Branco: "vestido-alma-branco.jpg",
    Preto: "vestido-alma-preto.jpg",
    Vermelho: "vestido-alma-vermelho.jpg",
  },
  "vestido-elegance": {
    Preto: "vestido-elegance-preto.jpg",
    Branco: "vestido-elegance-branco.jpg",
  },
  "vestido-costas-nua": {
    Verde: "vestido-costas-nua-verde.jpg",
    Marrom: "vestido-costas-nua-marrom.jpg",
  },
};

const COLOR_SEARCH_TERMS: Record<string, string[]> = {
  amarelo: ["amarelo"],
  azul: ["azul"],
  branco: ["branco", "branca", "branc"],
  preto: ["preto", "preta", "pret"],
  vermelho: ["vermelho", "vermelha"],
  rosa: ["rosa"],
  "rosa bebe": ["rosa"],
  ciano: ["ciano"],
  marrom: ["marrom"],
  verde: ["verde"],
};

let cachedFiles: string[] | null = null;

function getImagesDir(): string {
  return path.join(process.cwd(), "public", "images");
}

export function getAvailableImageFiles(): string[] {
  if (cachedFiles) return cachedFiles;
  const dir = getImagesDir();
  if (!fs.existsSync(dir)) {
    cachedFiles = [];
    return cachedFiles;
  }
  cachedFiles = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  return cachedFiles;
}

export function clearImageFileCache(): void {
  cachedFiles = null;
}

function normalizeColor(color: string | null | undefined): string {
  return (color || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function fileExists(filename: string): boolean {
  return getAvailableImageFiles().includes(filename);
}

function basenameFromUrl(url: string): string {
  try {
    if (url.startsWith("http")) return new URL(url).pathname.split("/").pop() || "";
    return url.replace(/^\/images\//, "").split("?")[0];
  } catch {
    return url.split("/").pop() || "";
  }
}

function findBySlugAndColor(slug: string, color: string | null | undefined): string | null {
  const map = PRODUCT_IMAGE_MAP[slug];
  if (map && color && map[color]) {
    const mapped = map[color];
    if (fileExists(mapped)) return mapped;
  }

  const files = getAvailableImageFiles();
  const slugLower = slug.toLowerCase();
  const colorNorm = normalizeColor(color);
  const colorTerms = COLOR_SEARCH_TERMS[colorNorm] || (colorNorm ? [colorNorm] : []);

  const slugMatches = files.filter((f) => {
    const fl = f.toLowerCase();
    if (fl.startsWith(slugLower)) return true;
    const parts = slugLower.split("-").filter((p) => p.length > 3);
    return parts.some((part) => fl.includes(part));
  });

  if (colorTerms.length > 0 && slugMatches.length > 0) {
    const colorMatch = slugMatches.find((f) => {
      const fl = f.toLowerCase();
      return colorTerms.some((term) => fl.includes(term));
    });
    if (colorMatch) return colorMatch;
  }

  if (slugMatches.length > 0) return slugMatches[0];
  return null;
}

/** Retorna apenas o nome do arquivo (ex: biquini-amarelo.jpeg) */
export function resolveImageFilename(
  slug: string,
  color?: string | null,
  currentUrl?: string
): string | null {
  const fromMap = findBySlugAndColor(slug, color);
  if (fromMap) return fromMap;

  const currentBasename = currentUrl ? basenameFromUrl(currentUrl) : "";
  if (currentBasename && fileExists(currentBasename)) return currentBasename;

  return null;
}

export function toAbsoluteImageUrl(filename: string): string {
  return `${BACKEND_URL}/images/${filename}`;
}

/** Caminho relativo para gravar no banco (/images/arquivo.jpg) */
export function getSeedImagePath(slug: string, color: string): string {
  const filename = resolveImageFilename(slug, color);
  if (!filename) {
    console.warn(`[imageResolver] Sem imagem para slug=${slug} cor=${color}`);
    return `/images/${slug}.jpeg`;
  }
  return `/images/${filename}`;
}

/** URL absoluta pronta para o frontend */
export function resolveImageUrl(
  slug: string,
  image: { url: string; color?: string | null }
): string {
  // Priorizar URL armazenada no banco se já for absoluta
  if (image.url.startsWith("http")) return image.url;
  if (image.url.startsWith("/images/")) return `${BACKEND_URL}${image.url}`;
  
  // Tentar resolver pelo mapeamento manual
  const filename = resolveImageFilename(slug, image.color, image.url);
  if (filename) return toAbsoluteImageUrl(filename);

  const basename = basenameFromUrl(image.url);
  if (basename && fileExists(basename)) return toAbsoluteImageUrl(basename);

  return image.url;
}

export function resolveImageRows<T extends { url: string; color?: string | null }>(
  slug: string,
  images: T[]
): T[] {
  return images.map((img) => ({
    ...img,
    url: resolveImageUrl(slug, img),
  }));
}
