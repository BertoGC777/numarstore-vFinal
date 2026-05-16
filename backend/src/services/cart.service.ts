import { dbRun, dbGet, dbAll, getDatabase } from "../db";

export async function getCartByUser(userId: string | null) {
  await getDatabase();
  return await dbAll(`SELECT ci.id, ci.product_id, ci.color, ci.size, ci.quantity,
    p.slug, p.name, p.price_pix, p.price_card, pi.url as image
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.sort_order = 0
    WHERE ci.user_id = $1`, [userId]);
}

export async function addToCart(userId: string | null, productId: string, color: string, size: string, quantity = 1) {
  await getDatabase();
  const existing = await dbGet("SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2 AND color = $3 AND size = $4",
    [userId, productId, color, size]);
  if (existing) {
    await dbRun("UPDATE cart_items SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 AND color = $4 AND size = $5",
      [quantity, userId, productId, color, size]);
    return;
  }
  await dbRun("INSERT INTO cart_items (user_id, product_id, color, size, quantity) VALUES ($1, $2, $3, $4, $5)",
    [userId, productId, color, size, quantity]);
}

export async function updateCartItem(id: number, quantity: number) {
  await getDatabase();
  if (quantity <= 0) { await dbRun("DELETE FROM cart_items WHERE id = $1", [id]); return; }
  await dbRun("UPDATE cart_items SET quantity = $1 WHERE id = $2", [quantity, id]);
}

export async function removeFromCart(id: number) {
  await getDatabase();
  await dbRun("DELETE FROM cart_items WHERE id = $1", [id]);
}

export async function clearCart(userId: string | null) {
  await getDatabase();
  await dbRun("DELETE FROM cart_items WHERE user_id = $1", [userId]);
}

export async function getCartTotal(userId: string | null): Promise<number> {
  await getDatabase();
  const r = await dbGet<{ total: number | null }>("SELECT SUM(p.price_pix * ci.quantity) as total FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1", [userId]);
  return r?.total || 0;
}