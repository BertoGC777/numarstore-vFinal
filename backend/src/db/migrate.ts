import { dbRun, dbAll, getDatabase } from "./postgres";

/** Garante colunas necessárias no PostgreSQL de produção */
export async function runMigrations() {
  await getDatabase();

  const columns = await dbAll<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'products'`
  );
  const columnNames = columns.map((c) => c.column_name);

  if (!columnNames.includes("short_description")) {
    await dbRun(`ALTER TABLE products ADD COLUMN short_description TEXT`);
    console.log("✅ Migração: short_description adicionada");
  }

  if (!columnNames.includes("is_active")) {
    await dbRun(`ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`);
    console.log("✅ Migração: is_active adicionada");
  }

  await dbRun(`UPDATE products SET is_active = 1 WHERE is_active IS NULL`);

  const stockExists = await dbAll(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'product_stock'`
  );
  if (stockExists.length === 0) {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS product_stock (
        id SERIAL PRIMARY KEY,
        product_id TEXT NOT NULL,
        color TEXT,
        size TEXT,
        quantity INTEGER DEFAULT 0,
        UNIQUE(product_id, color, size),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Migração: product_stock criada");
  }
}
