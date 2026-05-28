import { getDatabase, dbAll } from "../db";

async function checkAllSchemas() {
  await getDatabase();

  const tables = await dbAll(`SELECT name FROM sqlite_master WHERE type='table'`);
  
  for (const table of tables) {
    const tableName = table.name;
    if (tableName === 'sqlite_sequence') continue;
    
    const schema = await dbAll(`PRAGMA table_info(${tableName})`);
    console.log(`\n=== ${tableName} ===`);
    console.log(JSON.stringify(schema, null, 2));
  }
}

checkAllSchemas().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
