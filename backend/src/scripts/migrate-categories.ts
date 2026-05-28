import { getDatabase, dbRun, dbAll, dbGet } from "../db";

async function migrateCategories() {
  await getDatabase();

  console.log("🔍 Verificando tabela categories...");

  // Verificar se a tabela categories existe (SQLite)
  try {
    const tableInfo = await dbAll(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='categories'
    `);

    if (tableInfo.length === 0) {
      console.log("➕ Criando tabela categories...");
      await dbRun(`
        CREATE TABLE categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          created_at INTEGER NOT NULL DEFAULT 0
        )
      `);
      console.log("✅ Tabela categories criada");
    } else {
      console.log("✅ Tabela categories já existe");
    }
  } catch (err) {
    // Se falhar, tentar PostgreSQL
    console.log("🔄 Tentando verificar tabela no PostgreSQL...");
    try {
      const categoriesTable = await dbAll(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'categories'
      `);

      if (categoriesTable.length === 0) {
        console.log("➕ Criando tabela categories no PostgreSQL...");
        await dbRun(`
          CREATE TABLE categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            created_at BIGINT NOT NULL DEFAULT 0
          )
        `);
        console.log("✅ Tabela categories criada no PostgreSQL");
      } else {
        console.log("✅ Tabela categories já existe no PostgreSQL");
      }
    } catch (pgErr) {
      console.error("❌ Erro ao verificar/criar tabela:", pgErr);
      throw pgErr;
    }
  }

  // Migrar categorias existentes de produtos para a tabela categories
  const existingCategories = await dbAll(`
    SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category
  `);

  console.log(`📦 Encontradas ${existingCategories.length} categorias em produtos`);

  for (const cat of existingCategories) {
    const categoryName = (cat as any).category;

    // Verificar se já existe na tabela categories
    const existing = await dbAll(`
      SELECT id FROM categories WHERE name = ?
    `, [categoryName]);

    if (existing.length === 0) {
      const id = crypto.randomUUID();
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const now = Date.now();

      await dbRun(`
        INSERT INTO categories (id, name, slug, created_at)
        VALUES (?, ?, ?, ?)
      `, [id, categoryName, slug, now]);

      console.log(`➕ Categoria migrada: ${categoryName}`);
    }
  }

  console.log("✅ Migração de categorias concluída");
}

migrateCategories().catch(err => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
