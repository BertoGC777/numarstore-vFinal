# Instruções para Migração do Banco de Produção

## O que foi feito

As seguintes mudanças foram implementadas no código:

### Backend
- Adicionados campos `short_description` e `is_active` à tabela `products`
- Criada tabela `product_stock` para gerenciamento de estoque
- Atualizadas funções `createProduct` e `updateProduct` para incluir estoque
- Adicionados endpoints para gerenciamento de estoque
- Criado script de migração `npm run migrate-production`

### Frontend
- Adicionada verificação de role admin no painel
- Adicionada seção de gerenciamento de estoque no FormularioProduto
- Melhorado tratamento de erros com logs
- Adicionado botão de ativar/desativar rápido

## Como executar a migração no banco de produção

### Opção 1: Via Render (Recomendada)

1. Acesse o painel do Render: https://dashboard.render.com
2. Vá para o serviço do backend (numarstore-backend)
3. Clique em "Shell" ou "SSH"
4. Execute o seguinte comando:
```bash
cd /opt/render/project/backend
npm run migrate-production
```

### Opção 2: Via PostgreSQL direto

1. Conecte ao banco PostgreSQL de produção usando pgAdmin, DBeaver ou outro cliente
2. Execute o seguinte SQL:

```sql
-- Adicionar colunas à tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active INTEGER DEFAULT 1;

-- Criar tabela de estoque
CREATE TABLE IF NOT EXISTS product_stock (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL,
  color TEXT,
  size TEXT,
  quantity INTEGER DEFAULT 0,
  UNIQUE(product_id, color, size),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Atualizar produtos existentes
UPDATE products SET is_active = 1 WHERE is_active IS NULL;
```

### Opção 3: Via script local com DATABASE_URL

1. Copie a DATABASE_URL do painel do Render
2. Execute localmente:
```bash
cd backend
DATABASE_URL="sua-database-url-aqui" npm run migrate-production
```

## Após a migração

1. **Verifique o deploy automático:**
   - O Vercel deve fazer deploy automático do frontend
   - O Render deve fazer deploy automático do backend

2. **Teste o painel admin:**
   - Acesse https://numarstore-v-final.vercel.app/admin
   - Faça login com as credenciais de admin
   - Verifique se o Dashboard e Analytics carregam
   - Teste a listagem, edição e exclusão de produtos
   - Teste a funcionalidade de gerenciamento de estoque

3. **Resetar senha do admin se necessário:**
   - Se não conseguir fazer login, execute:
   ```bash
   cd backend
   DATABASE_URL="sua-database-url-aqui" npm run reset-admin-password
   ```
   - Nova senha: admin123

## Scripts disponíveis

- `npm run create-admin` - Criar usuário admin
- `npm run check-admin` - Verificar usuários no banco
- `npm run reset-admin-password` - Resetar senha do admin
- `npm run migrate-postgres` - Migrar banco PostgreSQL local
- `npm run migrate-production` - Migrar banco de produção

## Suporte

Se encontrar algum problema:
1. Verifique os logs no painel do Render
2. Verifique os logs no painel do Vercel
3. Verifique o console do navegador para erros
