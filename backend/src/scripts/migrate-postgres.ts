import { dbRun, dbAll, dbGet, getDatabase } from "../db";

async function migratePostgres() {
  await getDatabase();
  
  console.log("🔍 Verificando schema do PostgreSQL...");
  
  // Verificar se a tabela products existe
  const productsTable = await dbGet(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products'
  `);
  
  if (!productsTable) {
    console.log("❌ Tabela products não encontrada");
    return;
  }
  
  console.log("✅ Tabela products encontrada");
  console.log("Colunas:", productsTable);
  
  // Adicionar colunas se não existirem
  const columns = productsTable as any[];
  const columnNames = columns.map((c: any) => c.column_name);
  
  if (!columnNames.includes('short_description')) {
    console.log("➕ Adicionando coluna short_description...");
    await dbRun(`ALTER TABLE products ADD COLUMN short_description TEXT`);
    console.log("✅ Coluna short_description adicionada");
  }
  
  if (!columnNames.includes('is_active')) {
    console.log("➕ Adicionando coluna is_active...");
    await dbRun(`ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`);
    console.log("✅ Coluna is_active adicionada");
  }
  
  // Verificar se a tabela product_stock existe
  const stockTable = await dbGet(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'product_stock'
  `);
  
  if (!stockTable) {
    console.log("➕ Criando tabela product_stock...");
    await dbRun(`
      CREATE TABLE product_stock (
        id SERIAL PRIMARY KEY,
        product_id TEXT NOT NULL,
        color TEXT,
        size TEXT,
        quantity INTEGER DEFAULT 0,
        UNIQUE(product_id, color, size),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Tabela product_stock criada");
  }
  
  // Verificar produtos
  const products = await dbAll(`SELECT COUNT(*) as count FROM products`);
  console.log(`📦 Total de produtos: ${products[0].count}`);
  
  // Verificar usuários admin
  const adminUsers = await dbAll(`SELECT id, name, email, role FROM users WHERE role = 'admin'`);
  if (adminUsers.length > 0) {
    console.log("👤 Usuários admin encontrados:");
    adminUsers.forEach((u: any) => {
      console.log(`  - ${u.name} (${u.email})`);
    });
  } else {
    console.log("⚠️  Nenhum usuário admin encontrado");
  }
  
  console.log("✅ Migração concluída");
}

migratePostgres().catch(console.error);
