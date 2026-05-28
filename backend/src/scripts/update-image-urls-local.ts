import { getDatabase, dbRun, dbAll } from "../db";

async function updateImageUrlsToLocal() {
  await getDatabase();

  console.log("🔍 Atualizando URLs das imagens para usar backend local...");

  const products = await dbAll(`SELECT id, slug FROM products`);
  let updatedCount = 0;

  for (const product of products) {
    const images = await dbAll(`SELECT id, url FROM product_images WHERE product_id = ?`, [product.id]);

    for (const img of images) {
      const oldUrl = img.url;
      // Substituir URL do Render por URL local
      const newUrl = oldUrl.replace('https://numarstore-backend.onrender.com', 'http://localhost:3001');

      if (newUrl !== oldUrl) {
        await dbRun(`UPDATE product_images SET url = ? WHERE id = ?`, [newUrl, img.id]);
        updatedCount++;
        console.log(`Atualizado: ${oldUrl} -> ${newUrl}`);
      }
    }
  }

  console.log(`✅ ${updatedCount} URLs de imagens atualizadas para usar backend local`);
}

updateImageUrlsToLocal().catch(err => {
  console.error("❌ Erro ao atualizar URLs:", err);
  process.exit(1);
});
