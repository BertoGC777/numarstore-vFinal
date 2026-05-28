import { getDatabase, dbRun } from "../db";

async function fixProductsSchema() {
  await getDatabase();

  console.log("🔍 Verificando colunas faltantes na tabela products...");

  // Adicionar coluna short_description
  try {
    await dbRun(`ALTER TABLE products ADD COLUMN short_description TEXT`);
    console.log("✅ Coluna short_description adicionada");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("ℹ️  Coluna short_description já existe");
    } else {
      console.error("❌ Erro ao adicionar short_description:", err.message);
    }
  }

  // Adicionar coluna is_active
  try {
    await dbRun(`ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`);
    console.log("✅ Coluna is_active adicionada");
  } catch (err: any) {
    if (err.message.includes("duplicate column name")) {
      console.log("ℹ️  Coluna is_active já existe");
    } else {
      console.error("❌ Erro ao adicionar is_active:", err.message);
    }
  }

  console.log("✅ Schema da tabela products atualizado");
}

fixProductsSchema().catch(err => {
  console.error("❌ Erro na atualização do schema:", err);
  process.exit(1);
});
