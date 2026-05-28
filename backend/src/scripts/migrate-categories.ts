import { getDatabase, dbRun, dbAll } from "../db";

async function migrateCategories() {
  await getDatabase();

  console.log("🔍 Verificando tabela categories...");

  // Verificar se a tabela categories existe
  const categoriesTable = await dbAll(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'categories'
  `);

  if (categoriesTable.length === 0) {
    console.log("➕ Criando tabela categories...");
    await dbRun(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at BIGINT NOT NULL DEFAULT 0
      )
    `);
    console.log("✅ Tabela categories criada");
  } else {
    console.log("✅ Tabela categories já existe");
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
      SELECT id FROM categories WHERE name = $1
    `, [categoryName]);

    if (existing.length === 0) {
      const id = crypto.randomUUID();
      const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const now = Date.now();

      await dbRun(`
        INSERT INTO categories (id, name, slug, created_at)
        VALUES ($1, $2, $3, $4)
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
