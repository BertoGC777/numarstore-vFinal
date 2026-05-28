import { dbAll, dbGet, dbRun, getDatabase } from "../db";
import { resolveImageRows } from "../utils/imageResolver";

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

  const productsWithImages = await Promise.all(
    products.map(async (product: { id: string; slug: string; is_active?: number }) => {
      const images = await dbAll(
        `SELECT url, color FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
        [product.id]
      );
      return {
        ...product,
        is_active: product.is_active ?? 1,
        images: resolveImageRows(product.slug, images),
      };
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
  
  console.log("=== getProductById ===");
  console.log("Product ID:", id);
  
  const product = await dbGet(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );

  console.log("Product from database:", product);
  console.log("Product category:", product?.category);

  if (!product) {
    throw new Error("Produto não encontrado");
  }

  const images = resolveImageRows(
    product.slug,
    await dbAll(
      `SELECT id, url, color, color_hex as colorHex, sort_order as sortOrder FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
      [id]
    )
  );

  const colors = await dbAll(
    `SELECT name, hex FROM product_colors WHERE product_id = $1`,
    [id]
  );

  const sizes = await dbAll(
    `SELECT size FROM product_sizes WHERE product_id = $1`,
    [id]
  );

  const stock = await dbAll(
    `SELECT color, size, quantity FROM product_stock WHERE product_id = $1`,
    [id]
  );

  const stockRecord: Record<string, number> = {};
  stock.forEach((s: any) => {
    stockRecord[`${s.color}-${s.size}`] = s.quantity;
  });

  const result = {
    ...product,
    is_active: product.is_active ?? 1,
    images,
    colors,
    sizes: sizes.map((s: any) => s.size),
    stock: stockRecord
  };

  console.log("Product to return:", result);
  console.log("Product category in result:", result.category);

  return result;
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
    stock,
    is_new,
    is_sale,
    is_active
  } = data;

  if (!name || !price_pix || !price_card) {
    throw new Error("Nome, preço PIX e preço cartão são obrigatórios");
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  // Generate slug if not provided
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Insert product
  await dbRun(
    `INSERT INTO products (id, slug, name, description, short_description, category, subcategory, price_pix, price_card, old_price, is_new, is_sale, discount, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [id, finalSlug, name, description, shortDescription || null, category, subcategory || null, price_pix, price_card, originalPrice || null, is_new ? 1 : 0, is_sale ? 1 : 0, discount || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, now]
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

  // Insert stock if provided
  if (stock && typeof stock === 'object') {
    for (const [key, quantity] of Object.entries(stock)) {
      const [colorName, size] = key.split('-');
      const qty = parseInt(String(quantity), 10) || 0;
      if (qty > 0) {
        await dbRun(
          `INSERT INTO product_stock (product_id, color, size, quantity) VALUES ($1, $2, $3, $4)`,
          [id, colorName, size, qty]
        );
      }
    }
  }

  return await getProductById(id);
}

export async function updateProduct(id: string, data: any) {
  await getDatabase();
  
  console.log("=== updateProduct ===");
  console.log("Product ID:", id);
  console.log("Data received:", JSON.stringify(data, null, 2));
  
  // Verificar se o produto existe
  const existingProduct = await dbGet(
    `SELECT id FROM products WHERE id = $1`,
    [id]
  );
  
  console.log("Existing product:", existingProduct);
  
  if (!existingProduct) {
    console.error("Product not found:", id);
    throw new Error("Produto não encontrado");
  }
  
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
    stock,
    is_new,
    is_sale,
    is_active
  } = data;

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    if (!name || name.trim() === "") {
      throw new Error("Nome do produto é obrigatório");
    }
    fields.push(`name = $${paramIndex}`);
    values.push(name.trim());
    paramIndex++;
  }
  
  if (slug !== undefined) {
    const finalSlug = slug || name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!finalSlug || finalSlug.trim() === "") {
      throw new Error("Slug do produto é obrigatório");
    }
    fields.push(`slug = $${paramIndex}`);
    values.push(finalSlug.trim());
    paramIndex++;
  }
  if (category !== undefined) {
    // Categoria opcional - permitir edição de produtos sem categoria
    // if (!category || category.trim() === "") {
    //   throw new Error("Categoria do produto é obrigatória");
    // }
    // Não setar categoria como null se for string vazia - manter valor original
    if (category && category.trim() !== "") {
      fields.push(`category = $${paramIndex}`);
      values.push(category.trim());
      paramIndex++;
    }
  }
  if (subcategory !== undefined) {
    fields.push(`subcategory = $${paramIndex}`);
    values.push(subcategory ? subcategory.trim() : null);
    paramIndex++;
  }
  if (description !== undefined) {
    if (!description || description.trim() === "") {
      throw new Error("Descrição do produto é obrigatória");
    }
    fields.push(`description = $${paramIndex}`);
    values.push(description.trim());
    paramIndex++;
  }
  if (shortDescription !== undefined) {
    fields.push(`short_description = $${paramIndex}`);
    values.push(shortDescription ? shortDescription.trim() : null);
    paramIndex++;
  }
  if (price_pix !== undefined) {
    if (isNaN(price_pix) || price_pix < 0) {
      throw new Error("Preço PIX deve ser um número válido");
    }
    fields.push(`price_pix = $${paramIndex}`);
    values.push(price_pix);
    paramIndex++;
  }
  if (price_card !== undefined) {
    if (isNaN(price_card) || price_card < 0) {
      throw new Error("Preço cartão deve ser um número válido");
    }
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
    if (isNaN(discount) || discount < 0 || discount > 100) {
      throw new Error("Desconto deve ser um número entre 0 e 100");
    }
    fields.push(`discount = $${paramIndex}`);
    values.push(discount);
    paramIndex++;
  }
  if (is_active !== undefined) {
    fields.push(`is_active = $${paramIndex}`);
    values.push(is_active ? 1 : 0);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error("Nenhum campo para atualizar");
  }

  await dbRun(
    `UPDATE products SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    [...values, id]
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

  // Update stock if provided
  if (stock !== undefined && typeof stock === 'object') {
    await dbRun(`DELETE FROM product_stock WHERE product_id = $1`, [id]);
    for (const [key, quantity] of Object.entries(stock)) {
      const [colorName, size] = key.split('-');
      const qty = parseInt(String(quantity), 10) || 0;
      if (qty > 0) {
        await dbRun(
          `INSERT INTO product_stock (product_id, color, size, quantity) VALUES ($1, $2, $3, $4)`,
          [id, colorName, size, qty]
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

// Stock Management
export async function updateProductStock(productId: string, stock: Record<string, number>) {
  await getDatabase();
  
  // Delete existing stock for this product
  await dbRun(`DELETE FROM product_stock WHERE product_id = $1`, [productId]);
  
  // Insert new stock entries
  for (const [key, quantity] of Object.entries(stock)) {
    const [colorIdx, size] = key.split('-');
    await dbRun(
      `INSERT INTO product_stock (product_id, color, size, quantity) VALUES ($1, $2, $3, $4)`,
      [productId, colorIdx, size, quantity]
    );
  }
}

export async function getProductStock(productId: string) {
  await getDatabase();
  
  const stock = await dbAll(
    `SELECT color, size, quantity FROM product_stock WHERE product_id = $1`,
    [productId]
  );
  
  // Convert to record format
  const stockRecord: Record<string, number> = {};
  stock.forEach((s: any) => {
    stockRecord[`${s.color}-${s.size}`] = s.quantity;
  });
  
  return stockRecord;
}

// Customers/Users Management
interface GetCustomersFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export async function getCustomers(filters: GetCustomersFilters) {
  await getDatabase();
  
  const { search, role, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (role && role !== "todos") {
    whereClause += ` AND role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get customers
  const customers = await dbAll(
    `SELECT 
      u.id, u.name, u.email, u.phone, u.role, u.created_at,
      (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
      (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = u.id AND status IN ('paid', 'sent', 'delivered')) as total_spent
     FROM users u
     WHERE ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    customers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getCustomerById(id: string) {
  await getDatabase();
  
  const customer = await dbGet(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );

  if (!customer) {
    throw new Error("Cliente não encontrado");
  }

  // Get customer orders
  const orders = await dbAll(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  return { ...customer, orders };
}

export async function updateCustomer(id: string, data: any) {
  await getDatabase();
  
  const { name, email, phone, role } = data;

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(name);
    paramIndex++;
  }
  if (email !== undefined) {
    fields.push(`email = $${paramIndex}`);
    values.push(email);
    paramIndex++;
  }
  if (phone !== undefined) {
    fields.push(`phone = $${paramIndex}`);
    values.push(phone);
    paramIndex++;
  }
  if (role !== undefined) {
    fields.push(`role = $${paramIndex}`);
    values.push(role);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error("Nenhum campo para atualizar");
  }

  fields.push(`id = $${paramIndex}`);
  values.push(id);
  paramIndex++;

  await dbRun(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  return await getCustomerById(id);
}

export async function deleteCustomer(id: string) {
  await getDatabase();
  
  // Check if customer has orders
  const ordersCount = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM orders WHERE user_id = $1`,
    [id]
  );

  if (ordersCount?.count && ordersCount.count > 0) {
    throw new Error("Não é possível excluir cliente com pedidos. Considere desativar a conta.");
  }
  
  // Delete customer
  await dbRun(`DELETE FROM users WHERE id = $1`, [id]);
}

// Product Bundles/Combos Management
interface GetBundlesFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function getBundles(filters: GetBundlesFilters) {
  await getDatabase();
  
  const { search, page = 1, limit = 12 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "category = 'Conjuntos'";
  const params: any[] = [];
  let paramIndex = 1;

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

  // Get bundles
  const bundles = await dbAll(
    `SELECT * FROM products WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const bundlesWithImages = await Promise.all(
    bundles.map(async (bundle: { id: string; slug: string }) => {
      const images = await dbAll(
        `SELECT url, color FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
        [bundle.id]
      );
      return { ...bundle, images: resolveImageRows(bundle.slug, images) };
    })
  );

  return {
    bundles: bundlesWithImages,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getBundleById(id: string) {
  await getDatabase();
  
  const bundle = await dbGet(
    `SELECT * FROM products WHERE id = $1 AND category = 'Conjuntos'`,
    [id]
  );

  if (!bundle) {
    throw new Error("Conjunto não encontrado");
  }

  const images = resolveImageRows(
    bundle.slug,
    await dbAll(
      `SELECT id, url, color, color_hex as colorHex, sort_order as sortOrder FROM product_images WHERE product_id = $1 ORDER BY sort_order`,
      [id]
    )
  );

  const colors = await dbAll(
    `SELECT name, hex FROM product_colors WHERE product_id = $1`,
    [id]
  );

  const sizes = await dbAll(
    `SELECT size FROM product_sizes WHERE product_id = $1`,
    [id]
  );

  const stock = await dbAll(
    `SELECT color, size, quantity FROM product_stock WHERE product_id = $1`,
    [id]
  );

  const stockRecord: Record<string, number> = {};
  stock.forEach((s: any) => {
    stockRecord[`${s.color}-${s.size}`] = s.quantity;
  });

  return {
    ...bundle,
    images,
    colors,
    sizes: sizes.map((s: any) => s.size),
    stock: stockRecord
  };
}

export async function createBundle(data: any) {
  await getDatabase();
  
  const {
    name,
    slug,
    description,
    shortDescription,
    price_pix,
    price_card,
    originalPrice,
    discount,
    colors,
    sizes,
    images,
    stock,
    is_new,
    is_sale,
    is_active,
    bundleProducts // Array of product IDs included in the bundle
  } = data;

  if (!name || !price_pix || !price_card) {
    throw new Error("Nome, preço PIX e preço cartão são obrigatórios");
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  // Generate slug if not provided
  const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Insert bundle as a product with category "Conjuntos"
  await dbRun(
    `INSERT INTO products (id, slug, name, description, short_description, category, subcategory, price_pix, price_card, old_price, is_new, is_sale, discount, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [id, finalSlug, name, description, shortDescription || null, "Conjuntos", null, price_pix, price_card, originalPrice || null, is_new ? 1 : 0, is_sale ? 1 : 0, discount || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, now]
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

  // Insert stock if provided
  if (stock && typeof stock === 'object') {
    for (const [key, quantity] of Object.entries(stock)) {
      const [colorIdx, size] = key.split('-');
      const qty = parseInt(String(quantity), 10) || 0;
      if (qty > 0) {
        await dbRun(
          `INSERT INTO product_stock (product_id, color, size, quantity) VALUES ($1, $2, $3, $4)`,
          [id, colorIdx, size, qty]
        );
      }
    }
  }

  // Store bundle products in metadata (we'll use the description field to store JSON for now)
  // In a real implementation, you'd want a separate table for bundle_products
  if (bundleProducts && Array.isArray(bundleProducts)) {
    const metadata = JSON.stringify({ bundleProducts });
    await dbRun(
      `UPDATE products SET description = $1 || ' || JSON_EXTRACT(description, '$.bundleProducts') WHERE id = $2`,
      [metadata, id]
    );
  }

  return await getBundleById(id);
}

export async function updateBundle(id: string, data: any) {
  await getDatabase();
  
  const {
    name,
    slug,
    description,
    shortDescription,
    price_pix,
    price_card,
    originalPrice,
    discount,
    colors,
    sizes,
    images,
    stock,
    is_new,
    is_sale,
    is_active,
    bundleProducts
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
  if (description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    values.push(description);
    paramIndex++;
  }
  if (shortDescription !== undefined) {
    fields.push(`short_description = $${paramIndex}`);
    values.push(shortDescription || null);
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
  if (is_active !== undefined) {
    fields.push(`is_active = $${paramIndex}`);
    values.push(is_active ? 1 : 0);
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

  // Update stock if provided
  if (stock !== undefined && typeof stock === 'object') {
    await dbRun(`DELETE FROM product_stock WHERE product_id = $1`, [id]);
    for (const [key, quantity] of Object.entries(stock)) {
      const [colorIdx, size] = key.split('-');
      const qty = parseInt(String(quantity), 10) || 0;
      if (qty > 0) {
        await dbRun(
          `INSERT INTO product_stock (product_id, color, size, quantity) VALUES ($1, $2, $3, $4)`,
          [id, colorIdx, size, qty]
        );
      }
    }
  }

  return await getBundleById(id);
}

export async function deleteBundle(id: string) {
  await getDatabase();
  
  // Delete related data first
  await dbRun(`DELETE FROM product_images WHERE product_id = $1`, [id]);
  await dbRun(`DELETE FROM product_colors WHERE product_id = $1`, [id]);
  await dbRun(`DELETE FROM product_sizes WHERE product_id = $1`, [id]);
  await dbRun(`DELETE FROM product_stock WHERE product_id = $1`, [id]);
  
  // Delete bundle
  await dbRun(`DELETE FROM products WHERE id = $1`, [id]);
}

// Coupons Management
interface GetCouponsFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getCoupons(filters: GetCouponsFilters) {
  await getDatabase();
  
  const { search, status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (status === "active") {
    whereClause += ` AND is_active = 1`;
  } else if (status === "inactive") {
    whereClause += ` AND is_active = 0`;
  }

  if (search) {
    whereClause += ` AND code ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Get total count
  const countResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM coupons WHERE ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get coupons
  const coupons = await dbAll(
    `SELECT * FROM coupons WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    coupons,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getCouponById(id: string) {
  await getDatabase();
  
  const coupon = await dbGet(
    `SELECT * FROM coupons WHERE id = $1`,
    [id]
  );

  if (!coupon) {
    throw new Error("Cupom não encontrado");
  }

  return coupon;
}

export async function createCoupon(data: any) {
  await getDatabase();
  
  const {
    code,
    type,
    value,
    min_purchase,
    max_discount,
    usage_limit,
    valid_from,
    valid_until,
    categories,
    products,
    is_active
  } = data;

  if (!code || !type || !value) {
    throw new Error("Código, tipo e valor são obrigatórios");
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  await dbRun(
    `INSERT INTO coupons (id, code, type, value, min_purchase, max_discount, usage_limit, used_count, valid_from, valid_until, categories, products, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      id,
      code.toUpperCase(),
      type,
      value,
      min_purchase || 0,
      max_discount || null,
      usage_limit || null,
      0,
      valid_from || null,
      valid_until || null,
      categories ? JSON.stringify(categories) : null,
      products ? JSON.stringify(products) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      now
    ]
  );

  return await getCouponById(id);
}

export async function updateCoupon(id: string, data: any) {
  await getDatabase();
  
  const {
    code,
    type,
    value,
    min_purchase,
    max_discount,
    usage_limit,
    valid_from,
    valid_until,
    categories,
    products,
    is_active
  } = data;

  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (code !== undefined) {
    fields.push(`code = $${paramIndex}`);
    values.push(code.toUpperCase());
    paramIndex++;
  }
  if (type !== undefined) {
    fields.push(`type = $${paramIndex}`);
    values.push(type);
    paramIndex++;
  }
  if (value !== undefined) {
    fields.push(`value = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }
  if (min_purchase !== undefined) {
    fields.push(`min_purchase = $${paramIndex}`);
    values.push(min_purchase);
    paramIndex++;
  }
  if (max_discount !== undefined) {
    fields.push(`max_discount = $${paramIndex}`);
    values.push(max_discount);
    paramIndex++;
  }
  if (usage_limit !== undefined) {
    fields.push(`usage_limit = $${paramIndex}`);
    values.push(usage_limit);
    paramIndex++;
  }
  if (valid_from !== undefined) {
    fields.push(`valid_from = $${paramIndex}`);
    values.push(valid_from);
    paramIndex++;
  }
  if (valid_until !== undefined) {
    fields.push(`valid_until = $${paramIndex}`);
    values.push(valid_until);
    paramIndex++;
  }
  if (categories !== undefined) {
    fields.push(`categories = $${paramIndex}`);
    values.push(categories ? JSON.stringify(categories) : null);
    paramIndex++;
  }
  if (products !== undefined) {
    fields.push(`products = $${paramIndex}`);
    values.push(products ? JSON.stringify(products) : null);
    paramIndex++;
  }
  if (is_active !== undefined) {
    fields.push(`is_active = $${paramIndex}`);
    values.push(is_active ? 1 : 0);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error("Nenhum campo para atualizar");
  }

  fields.push(`id = $${paramIndex}`);
  values.push(id);
  paramIndex++;

  await dbRun(
    `UPDATE coupons SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  return await getCouponById(id);
}

export async function deleteCoupon(id: string) {
  await getDatabase();
  
  await dbRun(`DELETE FROM coupons WHERE id = $1`, [id]);
}

export async function validateCoupon(code: string) {
  await getDatabase();
  
  const coupon = await dbGet(
    `SELECT * FROM coupons WHERE code = $1 AND is_active = 1`,
    [code.toUpperCase()]
  );

  if (!coupon) {
    throw new Error("Cupom inválido ou inativo");
  }

  const now = Date.now();

  // Check validity dates
  if (coupon.valid_from && now < coupon.valid_from) {
    throw new Error("Cupom ainda não é válido");
  }

  if (coupon.valid_until && now > coupon.valid_until) {
    throw new Error("Cupom expirado");
  }

  // Check usage limit
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    throw new Error("Cupom esgotado");
  }

  return coupon;
}

// Categories Management
export async function getCategories() {
  await getDatabase();
  
  // Get distinct categories from products
  const categories = await dbAll(
    `SELECT DISTINCT category FROM products ORDER BY category`
  );

  return categories.map((c: any) => c.category);
}

export async function addCategory(name: string) {
  await getDatabase();
  
  // Check if category already exists
  const existing = await dbGet(
    `SELECT category FROM products WHERE category = $1 LIMIT 1`,
    [name]
  );

  if (existing) {
    throw new Error("Categoria já existe");
  }

  // Create a placeholder product to establish the category
  const id = crypto.randomUUID();
  const now = Date.now();

  await dbRun(
    `INSERT INTO products (id, slug, name, description, category, price_pix, price_card, is_active, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, "Categoria placeholder", name, 0, 0, 0, now]
  );

  return name;
}

export async function deleteCategory(name: string) {
  await getDatabase();
  
  // Check if category has products
  const count = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM products WHERE category = $1`,
    [name]
  );

  if (count?.count && count.count > 1) {
    throw new Error("Não é possível excluir categoria com produtos. Remova ou reclassifique os produtos primeiro.");
  }

  // Delete the placeholder product if exists
  await dbRun(`DELETE FROM products WHERE category = $1`, [name]);
}

// Store Settings Management
export async function getStoreSettings() {
  await getDatabase();
  
  // For now, return default settings
  // In a real implementation, you'd have a settings table
  return {
    store_name: "Numar Store",
    store_email: "contato@numarstore.com",
    store_phone: "",
    store_address: "",
    free_shipping_threshold: 0,
    shipping_cost: 0,
    social_whatsapp: "",
    social_instagram: "",
    social_facebook: "",
    payment_methods: ["pix", "card"],
    currency: "BRL"
  };
}

export async function updateStoreSettings(settings: any) {
  await getDatabase();
  
  // For now, just return the settings
  // In a real implementation, you'd save to a settings table
  return settings;
}

// Activity Logs Management
interface GetActivityLogsFilters {
  user_id?: string;
  action?: string;
  entity_type?: string;
  page?: number;
  limit?: number;
}

export async function getActivityLogs(filters: GetActivityLogsFilters) {
  await getDatabase();
  
  const { user_id, action, entity_type, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "1=1";
  const params: any[] = [];
  let paramIndex = 1;

  if (user_id) {
    whereClause += ` AND user_id = $${paramIndex}`;
    params.push(user_id);
    paramIndex++;
  }

  if (action) {
    whereClause += ` AND action = $${paramIndex}`;
    params.push(action);
    paramIndex++;
  }

  if (entity_type) {
    whereClause += ` AND entity_type = $${paramIndex}`;
    params.push(entity_type);
    paramIndex++;
  }

  // Get total count
  const countResult = await dbGet<{ count: number }>(
    `SELECT COUNT(*) as count FROM activity_logs WHERE ${whereClause}`,
    params
  );
  const total = countResult?.count || 0;

  // Get logs with user info
  const logs = await dbAll(
    `SELECT 
      al.id, al.user_id, al.action, al.entity_type, al.entity_id, al.details, al.ip_address, al.created_at,
      u.name as user_name, u.email as user_email
     FROM activity_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

export async function logActivity(data: {
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
}) {
  await getDatabase();
  
  const { user_id, action, entity_type, entity_id, details, ip_address } = data;

  const id = crypto.randomUUID();
  const now = Date.now();

  await dbRun(
    `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, user_id || null, action, entity_type || null, entity_id || null, details || null, ip_address || null, now]
  );

  return id;
}

// Low Stock Notifications
export async function getLowStockProducts(threshold: number = 5) {
  await getDatabase();
  
  const products = await dbAll(
    `SELECT 
      p.id, p.name, p.category,
      ps.color, ps.size, ps.quantity
     FROM products p
     INNER JOIN product_stock ps ON p.id = ps.product_id
     WHERE ps.quantity <= $1 AND p.is_active = 1
     ORDER BY ps.quantity ASC`,
    [threshold]
  );

  return products;
}

// Subcategories
export async function getSubcategories(categorySlug?: string) {
  await getDatabase();
  
  if (categorySlug) {
    const subcategories = await dbAll(
      `SELECT * FROM subcategories WHERE category_slug = $1 ORDER BY name`,
      [categorySlug]
    );
    return subcategories;
  }
  
  const subcategories = await dbAll(
    `SELECT * FROM subcategories ORDER BY category_slug, name`
  );
  return subcategories;
}

export async function createSubcategory(name: string, categorySlug: string) {
  await getDatabase();
  
  // Generate slug from name
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const id = crypto.randomUUID();
  const now = Date.now();
  
  await dbRun(
    `INSERT INTO subcategories (id, name, slug, category_slug, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, name, slug, categorySlug, now]
  );
  
  return { id, name, slug, category_slug: categorySlug, created_at: now };
}

export async function deleteSubcategory(id: string) {
  await getDatabase();
  
  await dbRun(
    `DELETE FROM subcategories WHERE id = $1`,
    [id]
  );
}
