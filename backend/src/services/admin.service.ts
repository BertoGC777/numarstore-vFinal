import { dbAll, dbGet, dbRun, getDatabase } from "../db";

// Dashboard
export async function getDashboard() {
  await getDatabase();
  
  // Total sales
  const totalSalesResult = await dbGet<{ total: number }>(
    `SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status IN ('paid', 'sent', 'delivered')`
  );
  const totalSales = totalSalesResult?.total || 0;

  // Orders today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  
  const ordersTodayResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders WHERE created_at >= $1`,
    [todayTimestamp]
  );
  const ordersToday = ordersTodayResult?.count || 0;

  // Total products
  const totalProductsResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM products`
  );
  const totalProducts = totalProductsResult?.count || 0;

  // Average ticket
  const avgTicketResult = await dbGet<{ avg: number }>(
    `SELECT COALESCE(AVG(total), 0) as avg FROM orders WHERE status IN ('paid', 'sent', 'delivered')`
  );
  const averageTicket = avgTicketResult?.avg || 0;

  // Sales chart (last 7 days)
  const salesChart = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const startOfDay = date.getTime();
    const endOfDay = startOfDay + 86400000;

    const daySalesResult = await dbGet<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE created_at >= $1 AND created_at < $2 AND status IN ('paid', 'sent', 'delivered')`,
      [startOfDay, endOfDay]
    );
    salesChart.push({
      date: startOfDay,
      sales: daySalesResult?.total || 0
    });
  }

  // Recent orders (last 5)
  const recentOrders = await dbAll(
    `SELECT id, name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5`
  );

  // Top products
  const topProducts = await dbAll(
    `SELECT p.name, COALESCE(SUM(oi.quantity), 0) as total_sold, COALESCE(SUM(oi.quantity * oi.price_pix), 0) as revenue
     FROM products p
     LEFT JOIN order_items oi ON p.id = oi.product_id
     GROUP BY p.id, p.name
     ORDER BY total_sold DESC
     LIMIT 5`
  );

  return {
    totalSales,
    ordersToday,
    totalProducts,
    averageTicket,
    salesChart,
    recentOrders,
    topProducts
  };
}

// Analytics
export async function getAnalytics(period: string) {
  await getDatabase();
  
  let days = 7;
  if (period === "30d") days = 30;
  if (period === "90d") days = 90;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  const startTimestamp = startDate.getTime();

  // Revenue chart
  const revenueChart = [];
  const intervalDays = days <= 7 ? 1 : days <= 30 ? 7 : 30;
  
  for (let i = days; i >= 0; i -= intervalDays) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const startOfDay = date.getTime();
    const endOfDay = startOfDay + (intervalDays * 86400000);

    const periodRevenueResult = await dbGet<{ total: number }>(
      `SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE created_at >= $1 AND created_at < $2 AND status IN ('paid', 'sent', 'delivered')`,
      [startOfDay, endOfDay]
    );
    revenueChart.push({
      date: startOfDay,
      revenue: periodRevenueResult?.total || 0
    });
  }

  // Top products
  const topProducts = await dbAll(
    `SELECT p.name, COALESCE(SUM(oi.quantity), 0) as total_sold, COALESCE(SUM(oi.quantity * oi.price_pix), 0) as revenue
     FROM products p
     LEFT JOIN order_items oi ON p.id = oi.product_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= $1
     GROUP BY p.id, p.name
     HAVING SUM(oi.quantity) > 0
     ORDER BY total_sold DESC
     LIMIT 10`,
    [startTimestamp]
  );

  // Category sales
  const categorySales = await dbAll(
    `SELECT p.category, COALESCE(SUM(oi.quantity * oi.price_pix), 0) as total
     FROM products p
     LEFT JOIN order_items oi ON p.id = oi.product_id
     LEFT JOIN orders o ON oi.order_id = o.id AND o.created_at >= $1
     GROUP BY p.category
     HAVING SUM(oi.quantity * oi.price_pix) > 0
     ORDER BY total DESC`,
    [startTimestamp]
  );

  const totalCategoryRevenue = categorySales.reduce((sum, cat) => sum + cat.total, 0);
  const categorySalesWithPercentage = categorySales.map(cat => ({
    ...cat,
    percentage: totalCategoryRevenue > 0 ? (cat.total / totalCategoryRevenue) * 100 : 0
  }));

  // Conversion rate (simplified - orders / total users)
  const totalOrdersResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders WHERE created_at >= $1`,
    [startTimestamp]
  );
  const totalOrders = totalOrdersResult?.count || 0;

  const totalCustomersResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM users`
  );
  const totalCustomers = totalCustomersResult?.count || 0;

  const conversionRate = totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

  // Average ticket
  const avgTicketResult = await dbGet<{ avg: number }>(
    `SELECT COALESCE(AVG(total), 0) as avg FROM orders WHERE created_at >= $1 AND status IN ('paid', 'sent', 'delivered')`,
    [startTimestamp]
  );
  const averageTicket = avgTicketResult?.avg || 0;

  // Total revenue
  const totalRevenueResult = await dbGet<{ total: number }>(
    `SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE created_at >= $1 AND status IN ('paid', 'sent', 'delivered')`,
    [startTimestamp]
  );
  const totalRevenue = totalRevenueResult?.total || 0;

  return {
    revenueChart,
    topProducts,
    categorySales: categorySalesWithPercentage,
    conversionRate,
    averageTicket,
    totalCustomers,
    totalOrders,
    totalRevenue
  };
}

// Orders
interface GetOrdersFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getOrders(filters: GetOrdersFilters) {
  await getDatabase();
  
  const { status, search, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (status && status !== "todos") {
    whereClause += ` AND status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND name ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders WHERE ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get orders
  const orders = await dbAll(
    `SELECT 
      o.*,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o
     WHERE ${whereClause}
     ORDER BY o.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getOrderById(id: string) {
  await getDatabase();
  
  const order = await dbGet(
    `SELECT * FROM orders WHERE id = $1`,
    [id]
  );

  if (!order) {
    throw new Error("Pedido não encontrado");
  }

  const items = await dbAll(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [id]
  );

  return { ...order, items };
}

export async function updateOrderStatus(id: string, status: string) {
  await getDatabase();
  
  await dbRun(
    `UPDATE orders SET status = $1 WHERE id = $2`,
    [status, id]
  );

  const updated = await getOrderById(id);
  return updated;
}

// Products
interface GetProductsFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: GetProductsFilters) {
  await getDatabase();
  
  const { category, search, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (category && category !== "todas") {
    whereClause += ` AND category = $${paramIndex}`;
    params.push(category);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND name ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM products WHERE ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get products
  const products = await dbAll(
    `SELECT * FROM products WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  // Get images for each product
  const productsWithImages = await Promise.all(
    products.map(async (product: any) => {
      const images = await dbAll(
        `SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
        [product.id]
      );
      return { ...product, images };
    })
  );

  return {
    products: productsWithImages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getProductById(id: string) {
  await getDatabase();
  
  const product = await dbGet(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );

  if (!product) {
    throw new Error("Produto não encontrado");
  }

  const images = await dbAll(
    `SELECT id, url, color, color_hex as colorHex, sort_order as sortOrder FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
    [id]
  );

  const colors = await dbAll(
    `SELECT name, hex FROM product_colors WHERE product_id = $1`,
    [id]
  );

  const sizes = await dbAll(
    `SELECT size FROM product_sizes WHERE product_id = $1`,
    [id]
  );

  return {
    ...product,
    images,
    colors,
    sizes: sizes.map((s: any) => s.size)
  };
}

export async function createProduct(data: any) {
  await getDatabase();
  
  const {
    name,
    slug,
    category,
    subcategory,
    description,
    shortDescription,
    price_pix,
    price_card,
    originalPrice,
    discount,
    colors,
    sizes,
    images,
    is_new,
    is_sale,
    is_active
  } = data;

  if (!name || !category || !price_pix || !price_card) {
    throw new Error("Nome, categoria, preço PIX e preço cartão são obrigatórios");
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  // Generate slug if not provided
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Insert product
  await dbRun(
    `INSERT INTO products (id, slug, name, description, category, subcategory, price_pix, price_card, old_price, is_new, is_sale, discount, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [id, finalSlug, name, description, category, subcategory || null, price_pix, price_card, originalPrice || null, is_new ? 1 : 0, is_sale ? 1 : 0, discount || 0, now]
  );

  // Insert colors
  if (colors && Array.isArray(colors)) {
    for (const color of colors) {
      await dbRun(
        `INSERT INTO product_colors (product_id, name, hex) VALUES ($1, $2, $3)`,
        [id, color.name, color.hex]
      );
    }
  }

  // Insert sizes
  if (sizes && Array.isArray(sizes)) {
    for (const size of sizes) {
      await dbRun(
        `INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)`,
        [id, size]
      );
    }
  }

  // Insert images
  if (images && Array.isArray(images)) {
    for (let i = 0; i < images.length; i++) {
      await dbRun(
        `INSERT INTO product_images (product_id, url, color, color_hex, sort_order) VALUES ($1, $2, $3, $4, $5)`,
        [id, images[i].url, images[i].color || null, images[i].colorHex || null, i]
      );
    }
  }

  return await getProductById(id);
}

export async function updateProduct(id: string, data: any) {
  await getDatabase();
  
  const {
    name,
    slug,
    category,
    subcategory,
    description,
    shortDescription,
    price_pix,
    price_card,
    originalPrice,
    discount,
    colors,
    sizes,
    images,
    is_new,
    is_sale,
    is_active
  } = data;

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
    
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    fields.push(`slug = $${paramIndex}`);
    values.push(finalSlug);
    paramIndex++;
  }
  if (category !== undefined) {
    fields.push(`category = $${paramIndex}`);
    values.push(category);
    paramIndex++;
  }
  if (subcategory !== undefined) {
    fields.push(`subcategory = $${paramIndex}`);
    values.push(subcategory || null);
    paramIndex++;
  }
  if (description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }
  if (price_pix !== undefined) {
    fields.push(`price_pix = $${paramIndex}`);
    values.push(price_pix);
    paramIndex++;
  }
  if (price_card !== undefined) {
    fields.push(`price_card = $${paramIndex}`);
    values.push(price_card);
    paramIndex++;
  }
  if (originalPrice !== undefined) {
    fields.push(`old_price = $${paramIndex}`);
    values.push(originalPrice || null);
    paramIndex++;
  }
  if (is_new !== undefined) {
    fields.push(`is_new = $${paramIndex}`);
    values.push(is_new ? 1 : 0);
    paramIndex++;
  }
  if (is_sale !== undefined) {
    fields.push(`is_sale = $${paramIndex}`);
    values.push(is_sale ? 1 : 0);
    paramIndex++;
  }
  if (discount !== undefined) {
    fields.push(`discount = $${paramIndex}`);
    values.push(discount);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error("Nenhum campo para atualizar");
  }

  fields.push(`id = $${paramIndex}`);
  values.push(id);
  paramIndex++;

  await dbRun(
    `UPDATE products SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  // Update colors if provided
  if (colors !== undefined) {
    await dbRun(`DELETE FROM product_colors WHERE product_id = $1`, [id]);
    if (Array.isArray(colors)) {
      for (const color of colors) {
        await dbRun(
          `INSERT INTO product_colors (product_id, name, hex) VALUES ($1, $2, $3)`,
          [id, color.name, color.hex]
        );
      }
    }
  }

  // Update sizes if provided
  if (sizes !== undefined) {
    await dbRun(`DELETE FROM product_sizes WHERE product_id = $1`, [id]);
    if (Array.isArray(sizes)) {
      for (const size of sizes) {
        await dbRun(
          `INSERT INTO product_sizes (product_id, size) VALUES ($1, $2)`,
          [id, size]
        );
      }
    }
  }

  // Update images if provided
  if (images !== undefined) {
    await dbRun(`DELETE FROM product_images WHERE product_id = $1`, [id]);
    if (Array.isArray(images)) {
      for (let i = 0; i < images.length; i++) {
        await dbRun(
          `INSERT INTO product_images (product_id, url, color, color_hex, sort_order) VALUES ($1, $2, $3, $4, $5)`,
          [id, images[i].url, images[i].color || null, images[i].colorHex || null, i]
        );
      }
    }
  }

  return await getProductById(id);
}

export async function deleteProduct(id: string) {
  await getDatabase();
  
  // Delete related data first
  await dbRun(`DELETE FROM product_images WHERE product_id = $1`, [id]);
  await dbRun(`DELETE FROM product_colors WHERE product_id = $1`, [id]);
  await dbRun(`DELETE FROM product_sizes WHERE product_id = $1`, [id]);
  
  // Delete product
  await dbRun(`DELETE FROM products WHERE id = $1`, [id]);
}

export async function addProductImages(productId: string, images: any[]) {
  await getDatabase();
  
  for (let i = 0; i < images.length; i++) {
    await dbRun(
      `INSERT INTO product_images (product_id, url, color, color_hex, sort_order) VALUES ($1, $2, $3, $4, $5)`,
      [productId, images[i].url, images[i].color || null, images[i].colorHex || null, i]
    );
  }
}

export async function removeProductImage(productId: string, imageId: string) {
  await getDatabase();
  
  await dbRun(
    `DELETE FROM product_images WHERE id = $1 AND product_id = $2`,
    [imageId, productId]
  );
}
