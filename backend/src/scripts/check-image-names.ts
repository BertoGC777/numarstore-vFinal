import { getDatabase, dbAll } from "../db";

async function checkImageNames() {
  await getDatabase();

  const images = await dbAll(`SELECT url FROM product_images`);
  console.log("Image URLs in database:");
  for (const img of images) {
    console.log(img.url);
  }
}

checkImageNames().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
