import { dbGet, dbRun, getDatabase } from "../db";

async function checkAdmin() {
  await getDatabase();
  
  const users = await dbGet<{ id: string; name: string; email: string; role: string }>(
    "SELECT id, name, email, role FROM users"
  );
  
  console.log("=== USUÁRIOS NO BANCO ===");
  if (users) {
    console.log(`ID: ${users.id}`);
    console.log(`Nome: ${users.name}`);
    console.log(`Email: ${users.email}`);
    console.log(`Role: ${users.role}`);
  } else {
    console.log("Nenhum usuário encontrado");
  }
  
  // Verificar se há usuário com role admin
  const adminUser = await dbGet<{ id: string; name: string; email: string }>(
    "SELECT id, name, email FROM users WHERE role = 'admin'"
  );
  
  if (adminUser) {
    console.log("\n=== USUÁRIO ADMIN ENCONTRADO ===");
    console.log(`ID: ${adminUser.id}`);
    console.log(`Nome: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
  } else {
    console.log("\n⚠️  NENHUM USUÁRIO COM ROLE ADMIN ENCONTRADO");
    console.log("Para criar um usuário admin, execute: npm run create-admin");
  }
}

checkAdmin().catch(console.error);
