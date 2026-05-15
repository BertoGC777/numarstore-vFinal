import { dbRun, dbGet, dbAll, getDatabase } from "../db";

export async function getCartByUser(userId: string | null) {
  await getDatabase();
  return dbAll(`SELECT ci.id, ci.product_id, ci.color, ci.size, ci.quantity,
    p.slug, p.name, p.price_pix, p.price_card, pi.url as image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0
    WHERE ci.user_id = ?`, [userId]);
}

export async function addToCart(userId: string | null, productId: string, color: string, size: string, quantity = 1) {
  await getDatabase();
  const existing = dbGet("SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND color = ? AND size = ?",
    [userId, productId, color, size]);
  if (existing) {
    dbRun("UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND color = ? AND size = ?",
      [quantity, userId, productId, color, size]);
    return;
  }
  dbRun("INSERT INTO cart_items (user_id, product_id, color, size, quantity) VALUES (?, ?, ?, ?, ?)",
    [userId, productId, color, size, quantity]);
}

export async function updateCartItem(id: number, quantity: number) {
  await getDatabase();
  if (quantity <= 0) { dbRun("DELETE FROM cart_items WHERE id = ?", [id]); return; }
  dbRun("UPDATE cart_items SET quantity = ? WHERE id = ?", [quantity, id]);
}

export async function removeFromCart(id: number) {
  await getDatabase();
  dbRun("DELETE FROM cart_items WHERE id = ?", [id]);
}

export async function clearCart(userId: string | null) {
  await getDatabase();
  dbRun("DELETE FROM cart_items WHERE user_id = ?", [userId]);
}

export async function getCartTotal(userId: string | null): Promise<number> {
  await getDatabase();
  const r = dbGet<{ total: number | null }>("SELECT SUM(p.price_pix * ci.quantity) as total FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?", [userId]);
  return r?.total || 0;
}