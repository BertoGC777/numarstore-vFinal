-- Migration: Tabela de pedidos
-- Cria tabela orders com campos para dados do cliente, pagamento e status

-- Habilita extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cria tabela orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  whatsapp_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: INSERT público (qualquer visitante pode criar um pedido)
CREATE POLICY "Permitir inserção pública de pedidos"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: SELECT apenas para service_role (só o backend vê os pedidos)
CREATE POLICY "Permitir leitura apenas para service_role"
  ON orders
  FOR SELECT
  TO service_role
  USING (true);

-- Índice em customer_email
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Índice em status
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
