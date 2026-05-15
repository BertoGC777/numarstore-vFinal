import { getDatabase, dbAll, dbGet } from "./src/db";
async function main() {
  try {
    await getDatabase();
    console.log("DB OK");
    const products = await dbAll("SELECT id, slug, name FROM products LIMIT 5");
    console.log("Products count:", products.length);
    console.log("First product:", JSON.stringify(products[0]));
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
main().catch(console.error);