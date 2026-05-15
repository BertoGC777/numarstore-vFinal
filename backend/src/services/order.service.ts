import { dbRun, dbGet, dbAll, getDatabase } from "../db";

export interface OrderData {
  paymentMethod: string; name: string; email: string; cpf?: string;
  phone: string; cep?: string; logradouro?: string; bairro?: string;
  localidade?: string; uf?: string; subtotal: number; shipping: number;
  discount: number; total: number; whatsappMsg: string;
  stripePaymentIntentId?: string; stripeStatus?: string;
  items: Array<{ product_id: string; name: string; image: string | null; color: string; size: string; quantity: number; price_pix: number }>;
}

export async function createOrder(userId: string | null, data: OrderData) {
  await getDatabase();
  const orderId = crypto.randomUUID();

  dbRun(`INSERT INTO orders (id, user_id, status, subtotal, shipping, discount, total,
    payment_method, name, email, cpf, phone, cep, logradouro, bairro, localidade, uf,
    whatsapp_msg, stripe_payment_intent_id, stripe_status, created_at)
    VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [orderId, userId, data.subtotal, data.shipping, data.discount, data.total,
     data.paymentMethod, data.name, data.email, data.cpf || null, data.phone,
     data.cep || null, data.logradouro || null, data.bairro || null,
     data.localidade || null, data.uf || null, data.whatsappMsg,
     data.stripePaymentIntentId || null, data.stripeStatus || null, Date.now()]);

  for (const item of data.items) {
    dbRun("INSERT INTO order_items (order_id, product_id, name, image, color, size, quantity, price_pix) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [orderId, item.product_id, item.name, item.image, item.color, item.size, item.quantity, item.price_pix]);
  }

  if (userId) {
    await clearCart(userId);
  }
  return orderId;
}

export async function getUserOrders(userId: string) {
  await getDatabase();
  return dbAll("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId]);
}

export async function getOrderById(id: string) {
  await getDatabase();
  const order = dbGet("SELECT * FROM orders WHERE id = ?", [id]);
  if (!order) return null;
  order.items = dbAll("SELECT * FROM order_items WHERE order_id = ?", [id]);
  return order;
}

async function clearCart(userId: string) {
  dbRun("DELETE FROM cart_items WHERE user_id = ?", [userId]);
}