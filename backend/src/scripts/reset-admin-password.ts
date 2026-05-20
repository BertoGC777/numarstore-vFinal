import bcrypt from "bcryptjs";
import { dbRun, dbGet, getDatabase } from "../db";

async function resetAdminPassword() {
  await getDatabase();
  
  const adminUser = await dbGet<{ id: string; name: string; email: string }>(
    "SELECT id, name, email FROM users WHERE role = 'admin'"
  );
  
  if (!adminUser) {
    console.log("❌ Nenhum usuário admin encontrado");
    return;
  }
  
  const newPassword = "admin123"; // Senha padrão
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await dbRun(
    "UPDATE users SET password_hash = $1 WHERE id = $2",
    [passwordHash, adminUser.id]
  );
  
  console.log("✅ Senha do admin resetada com sucesso");
  console.log(`Email: ${adminUser.email}`);
  console.log(`Nova senha: ${newPassword}`);
  console.log("\n⚠️  Por favor, altere a senha após fazer login!");
}

resetAdminPassword().catch(console.error);
