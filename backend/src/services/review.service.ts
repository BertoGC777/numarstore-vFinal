import { dbRun, dbGet, dbAll } from '../db/postgres';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  verified_purchase: boolean;
  images?: string[];
  helpful_count: number;
  is_approved: boolean;
  created_at: number;
}

export const createReview = async (review: Omit<Review, 'id' | 'helpful_count' | 'is_approved' | 'created_at'>): Promise<Review> => {
  const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  await dbRun(`
    INSERT INTO reviews (id, product_id, user_id, order_id, rating, title, comment, verified_purchase, images, helpful_count, is_approved, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [
    id,
    review.product_id,
    review.user_id,
    review.order_id || null,
    review.rating,
    review.title || null,
    review.comment || null,
    review.verified_purchase ? 1 : 0,
    review.images ? JSON.stringify(review.images) : null,
    0,
    0,
    now
  ]);

  return { ...review, id, helpful_count: 0, is_approved: false, created_at: now };
};

export const getReviewsByProductId = async (productId: string, approvedOnly = true): Promise<Review[]> => {
  const query = approvedOnly 
    ? 'SELECT * FROM reviews WHERE product_id = $1 AND is_approved = 1 ORDER BY created_at DESC'
    : 'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC';
  
  const results = await dbAll(query, [productId]);
  
  return results.map(row => ({
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    order_id: row.order_id,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    verified_purchase: row.verified_purchase === 1,
    images: row.images ? JSON.parse(row.images) : [],
    helpful_count: row.helpful_count,
    is_approved: row.is_approved === 1,
    created_at: row.created_at
  }));
};

export const getReviewById = async (id: string): Promise<Review | null> => {
  const result = await dbGet('SELECT * FROM reviews WHERE id = $1', [id]);
  
  if (!result) return null;
  
  return {
    id: result.id,
    product_id: result.product_id,
    user_id: result.user_id,
    order_id: result.order_id,
    rating: result.rating,
    title: result.title,
    comment: result.comment,
    verified_purchase: result.verified_purchase === 1,
    images: result.images ? JSON.parse(result.images) : [],
    helpful_count: result.helpful_count,
    is_approved: result.is_approved === 1,
    created_at: result.created_at
  };
};

export const getProductRating = async (productId: string): Promise<{ average: number; count: number }> => {
  const result = await dbGet(
    'SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE product_id = $1 AND is_approved = 1',
    [productId]
  );
  
  return {
    average: result?.avg ? parseFloat(result.avg.toFixed(1)) : 0,
    count: result?.count || 0
  };
};

export const approveReview = async (id: string): Promise<boolean> => {
  try {
    await dbRun('UPDATE reviews SET is_approved = 1 WHERE id = $1', [id]);
    return true;
  } catch {
    return false;
  }
};

export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    await dbRun('DELETE FROM reviews WHERE id = $1', [id]);
    return true;
  } catch {
    return false;
  }
};

export const markHelpful = async (id: string): Promise<boolean> => {
  try {
    await dbRun('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1', [id]);
    return true;
  } catch {
    return false;
  }
};

export const getAllReviews = async (approvedOnly = false): Promise<Review[]> => {
  const query = approvedOnly 
    ? 'SELECT * FROM reviews WHERE is_approved = 1 ORDER BY created_at DESC'
    : 'SELECT * FROM reviews ORDER BY created_at DESC';
  
  const results = await dbAll(query);
  
  return results.map(row => ({
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    order_id: row.order_id,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    verified_purchase: row.verified_purchase === 1,
    images: row.images ? JSON.parse(row.images) : [],
    helpful_count: row.helpful_count,
    is_approved: row.is_approved === 1,
    created_at: row.created_at
  }));
};
