import initSqlJs from "sql.js";
import path from "path";
import fs from "fs";

const dbDir = path.join(__dirname, "../../data");
const dbPath = path.join(dbDir, "numarstore.db");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db: any = null;

export async function getDatabase() {
  if (db) return db;
  const SQL = await initSqlJs({});

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      phone TEXT, password_hash TEXT NOT NULL, role TEXT DEFAULT 'user', created_at INTEGER NOT NULL DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      description TEXT NOT NULL, category TEXT NOT NULL, subcategory TEXT,
      price_pix REAL NOT NULL, price_card REAL NOT NULL, old_price REAL,
      is_new INTEGER DEFAULT 0, is_sale INTEGER DEFAULT 0, discount INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT,
      product_id TEXT NOT NULL, color TEXT NOT NULL, size TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1, UNIQUE(user_id, product_id, color, size)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, user_id TEXT, status TEXT NOT NULL DEFAULT 'pending',
      subtotal REAL NOT NULL, shipping REAL NOT NULL, discount REAL DEFAULT 0,
      total REAL NOT NULL, payment_method TEXT NOT NULL, name TEXT NOT NULL,
      email TEXT NOT NULL, cpf TEXT, phone TEXT NOT NULL, cep TEXT,
      logradouro TEXT, bairro TEXT, localidade TEXT, uf TEXT,
      whatsapp_msg TEXT, stripe_payment_intent_id TEXT, stripe_status TEXT,
      created_at INTEGER NOT NULL DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL,
      product_id TEXT NOT NULL, name TEXT NOT NULL, image TEXT,
      color TEXT NOT NULL, size TEXT NOT NULL, quantity INTEGER NOT NULL, price_pix REAL NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
      stripe_payment_intent_id TEXT, amount REAL NOT NULL, currency TEXT DEFAULT 'brl',
      metadata TEXT, created_at INTEGER NOT NULL DEFAULT 0
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL,
      url TEXT NOT NULL, color TEXT, color_hex TEXT, sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS product_colors (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL,
      name TEXT NOT NULL, hex TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS product_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT NOT NULL,
      size TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);
    await dbRun(`
      CREATE TABLE IF NOT EXISTS product_stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        color TEXT,
        size TEXT,
        quantity INTEGER DEFAULT 0,
        UNIQUE(product_id, color, size),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL, token TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
  }

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

function toRows(result: any): any[] {
  if (!result || !result.length) return [];
  const cols = result[0].columns;
  return result[0].values.map((vals: any[]) => {
    const obj: any = {};
    for (let i = 0; i < cols.length; i++) obj[cols[i]] = vals[i];
    return obj;
  });
}

export function dbRun(sql: string, params: any[] = []) {
  if (!db) throw new Error("DB not initialized. Call getDatabase() first.");
  const stmt = db.prepare(sql);
  stmt.bind(params);
  while (stmt.step()) {}
  stmt.free();
  saveDatabase();
}

export function dbAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!db) throw new Error("DB not initialized. Call getDatabase() first.");
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows as T[];
}

export function dbGet<T = any>(sql: string, params: any[] = []): T | null {
  const rows = dbAll<T>(sql, params);
  return rows.length ? rows[0] : null;
}