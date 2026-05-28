import { getDatabase, dbRun, dbAll } from "../db";

async function updateAllImageUrls() {
  await getDatabase();

  console.log("🔍 Atualizando todas as URLs das imagens para usar backend local...");

  const images = await dbAll(`SELECT id, url FROM product_images`);
  let updatedCount = 0;

  for (const img of images) {
    const oldUrl = img.url;
    // Substituir URLs do Render ou caminhos relativos por URL local
    const newUrl = oldUrl
      .replace('https://numarstore-backend.onrender.com', 'http://localhost:3001')
      .replace(/^\/images\//, 'http://localhost:3001/images/');

    if (newUrl !== oldUrl) {
      await dbRun(`UPDATE product_images SET url = ? WHERE id = ?`, [newUrl, img.id]);
      updatedCount++;
      console.log(`Atualizado: ${oldUrl} -> ${newUrl}`);
    }
  }

  console.log(`✅ ${updatedCount} URLs de imagens atualizadas para usar backend local`);
}

updateAllImageUrls().catch(err => {
  console.error("❌ Erro ao atualizar URLs:", err);
  process.exit(1);
});
