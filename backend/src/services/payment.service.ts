import { dbRun, dbGet, dbAll, getDatabase } from "../db";

export async function createPayment(paymentData: any) {
  await getDatabase();
  const id = crypto.randomUUID();
  await dbRun(`INSERT INTO payments (id, order_id, status, stripe_payment_intent_id, amount, currency, metadata, created_at)
    VALUES (?, ?, 'pending', ?, ?, 'brl', ?, ?)`,
    [id, paymentData.orderId, paymentData.stripePaymentIntentId || null, paymentData.amount,
     JSON.stringify(paymentData.metadata || {}), Date.now()]);
  return id;
}

export async function getPaymentById(id: string) {
  await getDatabase();
  return await dbGet("SELECT * FROM payments WHERE id = ?", [id]);
}

export async function updatePaymentStatus(id: string, status: string, stripePaymentIntentId?: string) {
  await getDatabase();
  if (stripePaymentIntentId) {
    await dbRun("UPDATE payments SET status = ?, stripe_payment_intent_id = ? WHERE id = ?", [status, stripePaymentIntentId, id]);
  } else {
    await dbRun("UPDATE payments SET status = ? WHERE id = ?", [status, id]);
  }
}

export async function getPaymentsByOrderId(orderId: string) {
  await getDatabase();
  return await dbAll("SELECT * FROM payments WHERE order_id = ?", [orderId]);
}

export { getDatabase };