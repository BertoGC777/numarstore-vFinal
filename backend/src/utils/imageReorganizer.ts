import { resolveImageUrl } from "./imageResolver";

export function reorganizeImagesByColor(
  imageRows: { url: string; color: string | null }[],
  colors: { name: string; hex: string }[],
  slug: string
): string[] {
  if (colors.length === 0) {
    return imageRows.map((i) => resolveImageUrl(slug, i));
  }

  // Agrupar imagens por cor
  const imagesByColor: Record<string, string[]> = {};
  colors.forEach((c) => (imagesByColor[c.name] = []));
  imagesByColor[""] = []; // Imagens sem cor

  imageRows.forEach((img) => {
    const colorName = img.color || "";
    if (!imagesByColor[colorName]) {
      imagesByColor[colorName] = [];
    }
    imagesByColor[colorName].push(resolveImageUrl(slug, img));
  });

  // Encontrar o número máximo de imagens por cor
  const maxImagesPerColor = Math.max(
    ...Object.values(imagesByColor).map((arr) => arr.length)
  );

  // Intercalar imagens: primeira de cada cor, depois segunda de cada cor, etc.
  const reordered: string[] = [];
  for (let i = 0; i < maxImagesPerColor; i++) {
    colors.forEach((c) => {
      const img = imagesByColor[c.name]?.[i];
      if (img) reordered.push(img);
    });
  }

  // Adicionar imagens sem cor no final
  if (imagesByColor[""]?.length > 0) {
    reordered.push(...imagesByColor[""]);
  }

  return reordered;
}
