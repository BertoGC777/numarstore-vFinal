const { getDatabase, dbAll, dbGet } = require('./dist/db');

async function main() {
  try {
    await getDatabase();
    // Lista todos os slugs
    const slugs = await dbAll("SELECT id, slug, name FROM products");
    console.log("Total products:", slugs.length);
    console.log("First 5 slugs:", JSON.stringify(slugs.slice(0, 5)));

    // Busca por slug específico
    const p1 = await dbGet("SELECT * FROM products WHERE slug = ?", ["biquini-amarelo"]);
    console.log("biquini-amarelo:", JSON.stringify(p1));

    const p2 = await dbGet("SELECT * FROM products WHERE slug = ?", ["vestido-costas-nua"]);
    console.log("vestido-costas-nua:", JSON.stringify(p2));

    // Verifica schema
    const tables = await dbAll("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables:", tables.map(t => t.name));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
main();