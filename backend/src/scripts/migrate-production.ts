import { dbRun, dbAll, dbGet, getDatabase } from "../db";

async function migrateProduction() {
  await getDatabase();
  
  console.log("🔍 Verificando schema do PostgreSQL em produção...");
  
  // Verificar se a tabela products existe e suas colunas
  const productsTable = await dbAll(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'products'
    ORDER BY ordinal_position
  `);
  
  if (!productsTable || productsTable.length === 0) {
    console.log("❌ Tabela products não encontrada");
    return;
  }
  
  console.log("✅ Tabela products encontrada");
  const columnNames = productsTable.map((c: any) => c.column_name);
  console.log("Colunas atuais:", columnNames);
  
  // Adicionar colunas se não existirem
  if (!columnNames.includes('short_description')) {
    console.log("➕ Adicionando coluna short_description...");
    await dbRun(`ALTER TABLE products ADD COLUMN short_description TEXT`);
    console.log("✅ Coluna short_description adicionada");
  } else {
    console.log("✅ Coluna short_description já existe");
  }
  
  if (!columnNames.includes('is_active')) {
    console.log("➕ Adicionando coluna is_active...");
    await dbRun(`ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`);
    console.log("✅ Coluna is_active adicionada");
  } else {
    console.log("✅ Coluna is_active já existe");
  }
  
  // Verificar se a tabela product_stock existe
  const stockTable = await dbAll(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'product_stock'
  `);
  
  if (!stockTable || stockTable.length === 0) {
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
  } else {
    console.log("✅ Tabela product_stock já existe");
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
  
  // Atualizar produtos existentes para is_active = 1 se estiverem como NULL
  const nullActiveProducts = await dbAll(`SELECT COUNT(*) as count FROM products WHERE is_active IS NULL`);
  if (nullActiveProducts[0].count > 0) {
    console.log(`➕ Atualizando ${nullActiveProducts[0].count} produtos com is_active NULL para 1...`);
    await dbRun(`UPDATE products SET is_active = 1 WHERE is_active IS NULL`);
    console.log("✅ Produtos atualizados");
  }
  
  console.log("✅ Migração concluída com sucesso!");
}

migrateProduction().catch(err => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
