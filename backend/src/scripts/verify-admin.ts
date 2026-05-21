import { dbGet, getDatabase } from "../db";

async function verifyAdmin() {
  await getDatabase();
  
  console.log("=== VERIFICAÇÃO DE ADMIN ===");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Configurado" : "NÃO configurado (usando SQLite)");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Configurado" : "NÃO configurado (usando default)");
  console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "Configurado" : "NÃO configurado (usando default)");
  
  const users = await dbGet<{ id: string; name: string; email: string; role: string }>(
    "SELECT id, name, email, role FROM users"
  );
  
  console.log("\n=== USUÁRIOS NO BANCO ===");
  if (users) {
    console.log(`ID: ${users.id}`);
    console.log(`Nome: ${users.name}`);
    console.log(`Email: ${users.email}`);
    console.log(`Role: ${users.role}`);
  } else {
    console.log("Nenhum usuário encontrado");
  }
  
  // Verificar se há usuário com role admin
  const adminUser = await dbGet<{ id: string; name: string; email: string; role: string }>(
    "SELECT id, name, email, role FROM users WHERE role = 'admin'"
  );
  
  if (adminUser) {
    console.log("\n=== USUÁRIO ADMIN ENCONTRADO ===");
    console.log(`ID: ${adminUser.id}`);
    console.log(`Nome: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
  } else {
    console.log("\n⚠️  NENHUM USUÁRIO COM ROLE ADMIN ENCONTRADO");
    console.log("Para criar um usuário admin, execute: npm run create-admin");
  }
}

verifyAdmin().catch(console.error);
