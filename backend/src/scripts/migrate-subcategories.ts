import { getDatabase, dbRun, dbAll } from "../db";

async function migrateSubcategories() {
  await getDatabase();

  console.log("🔍 Verificando tabela subcategories...");

  // Verificar se a tabela subcategories existe (SQLite)
  try {
    const tableInfo = await dbAll(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='subcategories'
    `);

    if (tableInfo.length === 0) {
      console.log("➕ Criando tabela subcategories...");
      await dbRun(`
        CREATE TABLE subcategories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          category_slug TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT 0
        )
      `);
      console.log("✅ Tabela subcategories criada");
    } else {
      console.log("✅ Tabela subcategories já existe");
    }
  } catch (err) {
    // Se falhar, tentar PostgreSQL
    console.log("🔄 Tentando verificar tabela no PostgreSQL...");
    try {
      const subcategoriesTable = await dbAll(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'subcategories'
      `);

      if (subcategoriesTable.length === 0) {
        console.log("➕ Criando tabela subcategories no PostgreSQL...");
        await dbRun(`
          CREATE TABLE subcategories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            category_slug TEXT NOT NULL,
            created_at BIGINT NOT NULL DEFAULT 0
          )
        `);
        console.log("✅ Tabela subcategories criada no PostgreSQL");
      } else {
        console.log("✅ Tabela subcategories já existe no PostgreSQL");
      }
    } catch (pgErr) {
      console.error("❌ Erro ao verificar/criar tabela:", pgErr);
      throw pgErr;
    }
  }

  // Verificar se há subcategorias para migrar
  const existingSubcategories = await dbAll(`
    SELECT * FROM subcategories
  `);

  console.log(`📦 Encontradas ${existingSubcategories.length} subcategorias`);

  console.log("✅ Migração de subcategorias concluída");
}

migrateSubcategories().catch(err => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
