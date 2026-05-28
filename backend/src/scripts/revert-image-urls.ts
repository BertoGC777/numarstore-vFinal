import { getDatabase, dbRun, dbAll } from "../db";

async function revertImageUrls() {
  await getDatabase();

  console.log("🔍 Revertendo URLs das imagens para usar servidor de produção...");

  const products = await dbAll(`SELECT id, slug FROM products`);
  let updatedCount = 0;

  for (const product of products) {
    const images = await dbAll(`SELECT id, url FROM product_images WHERE product_id = ?`, [product.id]);

    for (const img of images) {
      const oldUrl = img.url;
      // Reverter para URL do Render
      const newUrl = oldUrl.replace('http://localhost:3001', 'https://numarstore-backend.onrender.com');

      if (newUrl !== oldUrl) {
        await dbRun(`UPDATE product_images SET url = ? WHERE id = ?`, [newUrl, img.id]);
        updatedCount++;
        console.log(`Revertido: ${oldUrl} -> ${newUrl}`);
      }
    }
  }

  console.log(`✅ ${updatedCount} URLs de imagens revertidas para usar servidor de produção`);
}

revertImageUrls().catch(err => {
  console.error("❌ Erro ao reverter URLs:", err);
  process.exit(1);
});
