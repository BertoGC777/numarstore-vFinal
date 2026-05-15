import { dbRun, dbGet, dbAll, getDatabase } from "../db";

export function createPayment(paymentData: any) {
  const id = crypto.randomUUID();
  dbRun(`INSERT INTO payments (id, order_id, status, stripe_payment_intent_id, amount, currency, metadata, created_at)
    VALUES (?, ?, 'pending', ?, ?, 'brl', ?, ?)`,
    [id, paymentData.orderId, paymentData.stripePaymentIntentId || null, paymentData.amount,
     JSON.stringify(paymentData.metadata || {}), Date.now()]);
  return id;
}

export function getPaymentById(id: string) {
  return dbGet("SELECT * FROM payments WHERE id = ?", [id]);
}

export function updatePaymentStatus(id: string, status: string, stripePaymentIntentId?: string) {
  if (stripePaymentIntentId) {
    dbRun("UPDATE payments SET status = ?, stripe_payment_intent_id = ? WHERE id = ?", [status, stripePaymentIntentId, id]);
  } else {
    dbRun("UPDATE payments SET status = ? WHERE id = ?", [status, id]);
  }
}

export function getPaymentsByOrderId(orderId: string) {
  return dbAll("SELECT * FROM payments WHERE order_id = ?", [orderId]);
}

export { getDatabase };