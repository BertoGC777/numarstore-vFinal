import { dbRun, dbGet, dbAll } from '../db/postgres';

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage' | 'free_shipping';
  value: number;
  min_purchase: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from?: number;
  valid_until?: number;
  categories?: string;
  products?: string;
  is_active: boolean;
  created_at: number;
}

export const createCoupon = async (coupon: Omit<Coupon, 'id' | 'used_count' | 'created_at'>): Promise<Coupon> => {
  const id = `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  await dbRun(`
    INSERT INTO coupons (id, code, type, value, min_purchase, max_discount, usage_limit, used_count, valid_from, valid_until, categories, products, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  `, [
    id,
    coupon.code.toUpperCase(),
    coupon.type,
    coupon.value,
    coupon.min_purchase || 0,
    coupon.max_discount || null,
    coupon.usage_limit || null,
    0,
    coupon.valid_from || null,
    coupon.valid_until || null,
    coupon.categories || null,
    coupon.products || null,
    coupon.is_active ? 1 : 0,
    now
  ]);

  return { ...coupon, id, used_count: 0, created_at: now };
};

export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  const result = await dbGet(
    'SELECT * FROM coupons WHERE code = $1',
    [code.toUpperCase()]
  );
  
  if (!result) return null;
  
  return {
    id: result.id,
    code: result.code,
    type: result.type,
    value: result.value,
    min_purchase: result.min_purchase,
    max_discount: result.max_discount,
    usage_limit: result.usage_limit,
    used_count: result.used_count,
    valid_from: result.valid_from,
    valid_until: result.valid_until,
    categories: result.categories,
    products: result.products,
    is_active: result.is_active === 1,
    created_at: result.created_at
  };
};

export const validateCoupon = async (
  code: string,
  subtotal: number,
  productIds?: string[],
  category?: string
): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> => {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, error: 'Cupom inválido' };
  }

  if (!coupon.is_active) {
    return { valid: false, error: 'Cupom inativo' };
  }

  const now = Date.now();
  
  if (coupon.valid_from && now < coupon.valid_from) {
    return { valid: false, error: 'Cupom ainda não válido' };
  }

  if (coupon.valid_until && now > coupon.valid_until) {
    return { valid: false, error: 'Cupom expirado' };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: 'Limite de uso do cupom atingido' };
  }

  if (subtotal < coupon.min_purchase) {
    return { valid: false, error: `Valor mínimo de compra: R$ ${coupon.min_purchase.toFixed(2)}` };
  }

  // Check if coupon applies to specific products
  if (coupon.products && productIds) {
    const allowedProductIds = coupon.products.split(',');
    const hasValidProduct = productIds.some(id => allowedProductIds.includes(id));
    if (!hasValidProduct) {
      return { valid: false, error: 'Cupom não aplicável a estes produtos' };
    }
  }

  // Check if coupon applies to specific categories
  if (coupon.categories && category) {
    const allowedCategories = coupon.categories.split(',');
    if (!allowedCategories.includes(category)) {
      return { valid: false, error: 'Cupom não aplicável a esta categoria' };
    }
  }

  return { valid: true, coupon };
};

export const calculateDiscount = (coupon: Coupon, subtotal: number, shipping: number = 0): number => {
  let discount = 0;

  switch (coupon.type) {
    case 'fixed':
      discount = coupon.value;
      break;
    case 'percentage':
      discount = subtotal * (coupon.value / 100);
      break;
    case 'free_shipping':
      discount = shipping;
      break;
  }

  // Apply max discount limit if set
  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount;
  }

  // Discount cannot exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  return Math.round(discount * 100) / 100;
};

export const incrementCouponUsage = async (code: string): Promise<void> => {
  await dbRun(
    'UPDATE coupons SET used_count = used_count + 1 WHERE code = $1',
    [code.toUpperCase()]
  );
};

export const getAllCoupons = async (): Promise<Coupon[]> => {
  const results = await dbAll('SELECT * FROM coupons ORDER BY created_at DESC');
  
  return results.map(row => ({
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    min_purchase: row.min_purchase,
    max_discount: row.max_discount,
    usage_limit: row.usage_limit,
    used_count: row.used_count,
    valid_from: row.valid_from,
    valid_until: row.valid_until,
    categories: row.categories,
    products: row.products,
    is_active: row.is_active === 1,
    created_at: row.created_at
  }));
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<Coupon | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.code !== undefined) {
    fields.push(`code = $${paramIndex++}`);
    values.push(updates.code.toUpperCase());
  }
  if (updates.type !== undefined) {
    fields.push(`type = $${paramIndex++}`);
    values.push(updates.type);
  }
  if (updates.value !== undefined) {
    fields.push(`value = $${paramIndex++}`);
    values.push(updates.value);
  }
  if (updates.min_purchase !== undefined) {
    fields.push(`min_purchase = $${paramIndex++}`);
    values.push(updates.min_purchase);
  }
  if (updates.max_discount !== undefined) {
    fields.push(`max_discount = $${paramIndex++}`);
    values.push(updates.max_discount);
  }
  if (updates.usage_limit !== undefined) {
    fields.push(`usage_limit = $${paramIndex++}`);
    values.push(updates.usage_limit);
  }
  if (updates.valid_from !== undefined) {
    fields.push(`valid_from = $${paramIndex++}`);
    values.push(updates.valid_from);
  }
  if (updates.valid_until !== undefined) {
    fields.push(`valid_until = $${paramIndex++}`);
    values.push(updates.valid_until);
  }
  if (updates.categories !== undefined) {
    fields.push(`categories = $${paramIndex++}`);
    values.push(updates.categories);
  }
  if (updates.products !== undefined) {
    fields.push(`products = $${paramIndex++}`);
    values.push(updates.products);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    values.push(updates.is_active ? 1 : 0);
  }

  if (fields.length === 0) return null;

  values.push(id);
  await dbRun(
    `UPDATE coupons SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );

  return getCouponByCode(updates.code || (await getCouponById(id))?.code || '');
};

export const getCouponById = async (id: string): Promise<Coupon | null> => {
  const result = await dbGet('SELECT * FROM coupons WHERE id = $1', [id]);
  
  if (!result) return null;
  
  return {
    id: result.id,
    code: result.code,
    type: result.type,
    value: result.value,
    min_purchase: result.min_purchase,
    max_discount: result.max_discount,
    usage_limit: result.usage_limit,
    used_count: result.used_count,
    valid_from: result.valid_from,
    valid_until: result.valid_until,
    categories: result.categories,
    products: result.products,
    is_active: result.is_active === 1,
    created_at: result.created_at
  };
};

export const deleteCoupon = async (id: string): Promise<boolean> => {
  try {
    await dbRun('DELETE FROM coupons WHERE id = $1', [id]);
    return true;
  } catch {
    return false;
  }
};
