import { getDatabase as getSqliteDatabase, dbRun as sqliteRun, dbGet as sqliteGet, dbAll as sqliteAll } from "./sqlite";
import { getDatabase as getPostgresDatabase, dbRun as postgresRun, dbGet as postgresGet, dbAll as postgresAll } from "./postgres";
import { createSchema } from "./schema-postgres";
import { seedAll as seedPostgres } from "./seed-postgres";
import { seedAll as seedSqlite } from "./seed";

let usePostgres = false;

if (process.env.DATABASE_URL) {
  usePostgres = true;
  console.log("🔌 Using PostgreSQL database");
  (async () => {
    await getPostgresDatabase();
    await createSchema();
    await seedPostgres();
  })();
} else {
  console.log("🔌 Using SQLite database (fallback for local development)");
  getSqliteDatabase();
  seedSqlite();
}

export const getDatabase = usePostgres ? getPostgresDatabase : getSqliteDatabase;
export const dbRun = usePostgres ? postgresRun : sqliteRun;
export const dbGet = usePostgres ? postgresGet : sqliteGet;
export const dbAll = usePostgres ? postgresAll : sqliteAll;