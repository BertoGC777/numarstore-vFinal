import { getDatabase, dbRun } from "../db";

async function migrateMissingTables() {
  await getDatabase();

  console.log("🔍 Verificando tabelas faltantes...");

  // Criar tabela product_stock
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS product_stock (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        color TEXT,
        size TEXT,
        quantity INTEGER DEFAULT 0,
        UNIQUE(product_id, color, size)
      )
    `);
    console.log("✅ Tabela product_stock criada");
  } catch (err) {
    console.error("❌ Erro ao criar product_stock:", err);
  }

  // Criar tabela coupons
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        value REAL NOT NULL,
        min_purchase REAL DEFAULT 0,
        max_discount REAL,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        valid_from INTEGER,
        valid_until INTEGER,
        categories TEXT,
        products TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log("✅ Tabela coupons criada");
  } catch (err) {
    console.error("❌ Erro ao criar coupons:", err);
  }

  // Criar tabela reviews
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        order_id TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT,
        comment TEXT,
        verified_purchase INTEGER DEFAULT 0,
        images TEXT,
        helpful_count INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log("✅ Tabela reviews criada");
  } catch (err) {
    console.error("❌ Erro ao criar reviews:", err);
  }

  // Criar tabela activity_logs
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        ip_address TEXT,
        created_at INTEGER NOT NULL DEFAULT 0
      )
    `);
    console.log("✅ Tabela activity_logs criada");
  } catch (err) {
    console.error("❌ Erro ao criar activity_logs:", err);
  }

  console.log("✅ Migração de tabelas faltantes concluída");
}

migrateMissingTables().catch(err => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
