import { getDatabase, dbAll } from "../db";
import * as fs from "fs";
import * as path from "path";

async function mapImageNames() {
  await getDatabase();

  console.log("🔍 Mapeando nomes de imagens...");

  // Obter nomes esperados do banco
  const images = await dbAll(`SELECT DISTINCT url FROM product_images`);
  const expectedNames = new Set<string>();
  
  for (const img of images) {
    const url = img.url;
    const filename = url.split('/').pop();
    if (filename) {
      expectedNames.add(filename);
    }
  }

  console.log("Nomes esperados:", Array.from(expectedNames));

  // Listar arquivos na pasta de imagens
  const imagesDir = path.join(process.cwd(), "public", "images");
  const existingFiles = fs.readdirSync(imagesDir);
  
  console.log(`\nArquivos existentes em ${imagesDir}:`, existingFiles.length);

  // Mapeamento manual de nomes
  const mapping: Record<string, string> = {
    "biquini-amarelo-0.jpg": "biquini-amarelo.jpeg",
    "blusa-bella-vibe-0.jpg": "bella-vibe-branco.jpg",
    "blusa-night-0.jpg": "blusa-night-preta.jpg",
    "conjunto-cropped-saia-0.jpg": "conjunto-cropped-saia-1.jpeg",
    "cropped-verao-0.jpg": "cropped-verao-branco.jpg",
    "cropped-divine-0.jpg": "cropped-divine-preto.jpg",
    "saia-longa-0.jpg": "saia-longa-branca-1.jpeg",
    "short-saia-0.jpg": "short-saia-branco.jpeg",
    "saia-charme-0.jpg": "saia-charme-branco.jpg",
    "conjunto-vibe-0.jpg": "conjunto-vibe-branco.jpg",
    "conjunto-luau-0.jpg": "conjunto-luau-1.jpg",
    "conjunto-night-0.jpg": "conjunto-night-branco.jpg",
    "conjunto-night-curto-0.jpg": "conjunto-night-curto.jpg",
    "conjunto-style-0.jpg": "conjunto-style-rosa.jpg",
    "conjunto-divine-0.jpg": "conjunto-divine.jpg",
    "vestido-sereia-0.jpg": "vestido-sereia-rosa-1.jpg",
    "vestido-brisa-0.jpg": "vestido-brisa-rosa-1.jpg",
    "vestido-alma-0.jpg": "vestido-alma-branco.jpg",
    "vestido-elegance-0.jpg": "vestido-elegance-branco.jpg",
    "vestido-costas-nua-0.jpg": "vestido-costas-nua-verde.jpg"
  };

  let createdCount = 0;
  let skippedCount = 0;

  for (const [expected, source] of Object.entries(mapping)) {
    const sourcePath = path.join(imagesDir, source);
    const targetPath = path.join(imagesDir, expected);

    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Criado: ${expected} <- ${source}`);
        createdCount++;
      } else {
        console.log(`ℹ️  Já existe: ${expected}`);
        skippedCount++;
      }
    } else {
      console.log(`❌ Fonte não encontrada: ${source}`);
    }
  }

  console.log(`\n✅ ${createdCount} arquivos criados, ${skippedCount} já existiam`);
}

mapImageNames().catch(err => {
  console.error("❌ Erro ao mapear imagens:", err);
  process.exit(1);
});
