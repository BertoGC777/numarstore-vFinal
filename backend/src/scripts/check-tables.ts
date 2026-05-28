import { getDatabase, dbAll } from "../db";

async function checkTables() {
  await getDatabase();

  const tables = await dbAll(`SELECT name FROM sqlite_master WHERE type='table'`);
  console.log("Tables:", JSON.stringify(tables, null, 2));
}

checkTables().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
