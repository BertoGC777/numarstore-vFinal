-- Migration: Tabela de itens de pedido
-- Cria tabela order_items com relação para orders e produtos

-- Cria tabela order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  price_pix NUMERIC(10,2) NOT NULL,
  price_card NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_order_items_order_id 
    FOREIGN KEY (order_id) 
    REFERENCES orders(id) 
    ON DELETE CASCADE
);

-- Habilita Row Level Security (RLS)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: INSERT público
CREATE POLICY "Permitir inserção pública de itens de pedido"
  ON order_items
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: SELECT apenas para service_role
CREATE POLICY "Permitir leitura apenas para service_role"
  ON order_items
  FOR SELECT
  TO service_role
  USING (true);

-- Índice em order_id
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
