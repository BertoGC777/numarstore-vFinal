import { getDatabase, dbAll } from "../db";

async function checkProductImages() {
  await getDatabase();

  const products = await dbAll(`SELECT id, slug, name FROM products`);
  
  for (const product of products) {
    const images = await dbAll(`SELECT url, color FROM product_images WHERE product_id = ?`, [product.id]);
    console.log(`\n=== ${product.name} (${product.slug}) ===`);
    for (const img of images) {
      console.log(`  ${img.color}: ${img.url}`);
    }
  }
}

checkProductImages().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
