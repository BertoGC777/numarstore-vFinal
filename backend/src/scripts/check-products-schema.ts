import { getDatabase, dbAll } from "../db";

async function checkProductsSchema() {
  await getDatabase();

  const schema = await dbAll(`PRAGMA table_info(products)`);
  console.log("Products schema:", JSON.stringify(schema, null, 2));
}

checkProductsSchema().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
