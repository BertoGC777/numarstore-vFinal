import "dotenv/config";
import { getDatabase, dbRun, dbAll, dbGet } from "../db";

interface Product {
  slug: string;
  subcategory: string | null;
}

async function updateSubcategories() {
  await getDatabase();

  console.log("🔍 Atualizando subcategorias dos produtos existentes...\n");

  // UPDATE 1: Blusas
  console.log("📝 Atualizando Blusas...");
  await dbRun(
    `UPDATE products SET subcategory = 'blusas' WHERE slug IN ('blusa-bella-vibe', 'blusa-night')`
  );
  const blusas = await dbAll<Product>(
    `SELECT slug, subcategory FROM products WHERE slug IN ('blusa-bella-vibe', 'blusa-night')`
  );
  console.log("✅ Blusas atualizadas:");
  blusas.forEach(p => console.log(`   - ${p.slug}: ${p.subcategory}`));

  // UPDATE 2: Croppeds
  console.log("\n📝 Atualizando Croppeds...");
  await dbRun(
    `UPDATE products SET subcategory = 'croppeds' WHERE slug IN ('cropped-verao', 'cropped-divine')`
  );
  const croppeds = await dbAll<Product>(
    `SELECT slug, subcategory FROM products WHERE slug IN ('cropped-verao', 'cropped-divine')`
  );
  console.log("✅ Croppeds atualizados:");
  croppeds.forEach(p => console.log(`   - ${p.slug}: ${p.subcategory}`));

  // UPDATE 3: Saias
  console.log("\n📝 Atualizando Saias...");
  await dbRun(
    `UPDATE products SET subcategory = 'saias' WHERE slug IN ('saia-longa', 'saia-charme')`
  );
  const saias = await dbAll<Product>(
    `SELECT slug, subcategory FROM products WHERE slug IN ('saia-longa', 'saia-charme')`
  );
  console.log("✅ Saias atualizadas:");
  saias.forEach(p => console.log(`   - ${p.slug}: ${p.subcategory}`));

  // UPDATE 4: Shorts
  console.log("\n📝 Atualizando Shorts...");
  await dbRun(
    `UPDATE products SET subcategory = 'shorts' WHERE slug = 'short-saia'`
  );
  const shorts = await dbAll<Product>(
    `SELECT slug, subcategory FROM products WHERE slug = 'short-saia'`
  );
  console.log("✅ Shorts atualizados:");
  shorts.forEach(p => console.log(`   - ${p.slug}: ${p.subcategory}`));

  // Tabela resumo final
  console.log("\n📊 Tabela resumo de todos os produtos atualizados:");
  const allUpdated = await dbAll<Product>(
    `SELECT slug, subcategory FROM products WHERE slug IN (
      'blusa-bella-vibe', 'blusa-night',
      'cropped-verao', 'cropped-divine',
      'saia-longa', 'saia-charme',
      'short-saia'
    ) ORDER BY slug`
  );
  
  console.log("\n┌─────────────────────────┬──────────────────┐");
  console.log("│ Slug                    │ Subcategory      │");
  console.log("├─────────────────────────┼──────────────────┤");
  allUpdated.forEach(p => {
    console.log(`│ ${p.slug.padEnd(23)} │ ${(p.subcategory || 'null').padEnd(16)} │`);
  });
  console.log("└─────────────────────────┴──────────────────┘");

  console.log("\n✅ Atualização de subcategorias concluída!");
}

updateSubcategories().catch(console.error);
