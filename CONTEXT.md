# CONTEXT.md - Numar Store

**Fonte única de verdade para integração ao projeto Numar Store**

---

## Sumário

- [SEÇÃO 1 — Identidade do Projeto](#seção-1---identidade-do-projeto)
- [SEÇÃO 2 — Tech Stack](#seção-2---tech-stack)
- [SEÇÃO 3 — Estrutura de Diretórios](#seção-3---estrutura-de-diretórios)
- [SEÇÃO 4 — Variáveis de Ambiente](#seção-4---variáveis-de-ambiente)
- [SEÇÃO 5 — Banco de Dados](#seção-5---banco-de-dados)
- [SEÇÃO 6 — Rotas Frontend](#seção-6---rotas-frontend)
- [SEÇÃO 7 — Contextos React](#seção-7---contextos-react)
- [SEÇÃO 8 — Componentes](#seção-8---componentes)
- [SEÇÃO 9 — Páginas](#seção-9---páginas)
- [SEÇÃO 10 — Backend API](#seção-10---backend-api)
- [SEÇÃO 11 — Serviços Backend](#seção-11---serviços-backend)
- [SEÇÃO 12 — Sistema de Imagens](#seção-12---sistema-de-imagens)
- [SEÇÃO 13 — Supabase Edge Functions](#seção-13---supabase-edge-functions)
- [SEÇÃO 14 — Fluxo de Checkout e Pagamento](#seção-14---fluxo-de-checkout-e-pagamento)
- [SEÇÃO 15 — Autenticação](#seção-15---autenticação)
- [SEÇÃO 16 — Frete](#seção-16---frete)
- [SEÇÃO 17 — Funcionalidades por Status](#seção-17---funcionalidades-por-status)
- [SEÇÃO 18 — Histórico de Problemas Resolvidos](#seção-18---histórico-de-problemas-resolvidos)
- [SEÇÃO 19 — Decisões Arquiteturais](#seção-19---decisões-arquiteturais)
- [SEÇÃO 20 — Scripts de Manutenção Backend](#seção-20---scripts-de-manutenção-backend)
- [SEÇÃO 21 — Como Executar Localmente](#seção-21---como-executar-localmente)
- [SEÇÃO 22 — Arquivos Críticos](#seção-22---arquivos-críticos)
- [SEÇÃO 23 — Regras e Convenções](#seção-23---regras-e-convenções)
- [SEÇÃO 24 — Próximos Passos e Pendências](#seção-24---próximos-passos-e-pendências)
- [SEÇÃO 25 — Registro de Auditoria](#seção-25---registro-de-auditoria)

---

## SEÇÃO 1 — Identidade do Projeto

**Nome:** Numar Store  
**Tipo:** E-commerce de moda feminina  
**Propósito:** Loja online de roupas femininas com checkout via WhatsApp e integração de pagamentos  
**URL de Produção Frontend:** https://numarstore-v-final.vercel.app  
**URL de Produção Backend:** https://numarstore-backend.onrender.com/api  
**WhatsApp de Atendimento:** 5521979674510  
**Instagram:** @use.numar  
**Status Atual:** Fase de finalização pré-lançamento  
**Data da Última Atualização do Context:** 08/06/2026

---

## SEÇÃO 2 — Tech Stack

### Frontend

- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.19
- **Linguagem:** TypeScript 5.8.3
- **Routing:** React Router DOM 6.30.1
- **State Management:** React Context API
- **Data Fetching:** @tanstack/react-query 5.83.0
- **UI Components:** Radix UI (múltiplos pacotes @radix-ui/react-*)
- **Styling:** TailwindCSS 3.4.17 (configuração tradicional)
- **Icons:** Lucide React 0.462.0
- **Forms:** React Hook Form 7.61.1, Zod 3.25.76
- **Toast Notifications:** Sonner 1.7.4
- **Database Client:** @supabase/supabase-js 2.106.2
- **Payments:** @stripe/stripe-js 3.5.0 (integrado mas inativo)
- **SEO:** react-helmet-async 3.0.0
- **Charts:** Recharts 2.15.4
- **Testing:** Vitest 3.2.4, @testing-library/react 16.0.0

### Backend

- **Runtime:** Node.js
- **Framework:** Express 4.21.2
- **Linguagem:** TypeScript 5.7.2
- **Database:** PostgreSQL (via pg 8.20.0)
- **ORM:** Raw SQL queries (sem ORM)
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **Payments:** Stripe 16.12.0 (integrado mas inativo)
- **Email:** @sendgrid/mail 8.1.4
- **Security:** Helmet 8.1.0, express-rate-limit 8.2.1, cors 2.8.5
- **Compression:** compression 1.8.1
- **Environment:** dotenv 16.6.1
- **Error Tracking:** Sentry (integrado)
- **Dev Tools:** tsx 4.19.2

### Banco de Dados

- **PostgreSQL (Backend/Render):** Dados principais (users, products, orders, cart_items, coupons, reviews, activity_logs, categories, subcategories, password_reset_tokens, product_images, product_colors, product_sizes, product_stock, payments)
- **Supabase PostgreSQL:** Dados de pedidos (orders, order_items) para integração com Edge Functions
- **Supabase Storage:** Bucket product-images para uploads futuros

### Deploy

- **Frontend:** Vercel (https://numarstore-v-final.vercel.app)
- **Backend:** Render (https://numarstore-backend.onrender.com)
- **Database:** Supabase PostgreSQL (hospedado)
- **Edge Functions:** Supabase Edge Functions (Deno runtime)

### Versão do TailwindCSS

**TailwindCSS v3.4.17** (configuração tradicional com tailwind.config.ts, não v4)

---

## SEÇÃO 3 — Estrutura de Diretórios

```
numarstore-final/
├── backend/                           # Backend Node.js/Express
│   ├── public/                       # Arquivos estáticos (imagens de produtos)
│   │   └── images/                  # Imagens de produtos (153 arquivos)
│   ├── src/
│   │   ├── db/                      # Configuração de banco de dados
│   │   │   ├── postgres.ts         # Cliente PostgreSQL
│   │   │   ├── schema-postgres.ts   # Schema do banco
│   │   │   └── seed-postgres.ts    # Seed de dados iniciais
│   │   ├── middleware/              # Middlewares
│   │   │   └── auth.ts             # JWT auth, admin check, refresh
│   │   ├── routes/                  # Rotas da API
│   │   │   ├── auth.routes.ts      # Login, register, refresh, profile
│   │   │   ├── products.routes.ts  # CRUD produtos
│   │   │   ├── cart.routes.ts      # Carrinho (não usado atualmente)
│   │   │   ├── orders.routes.ts    # Pedidos
│   │   │   ├── cep.routes.ts       # ViaCEP integration
│   │   │   ├── payment.routes.ts   # Stripe payments
│   │   │   ├── stripe.routes.ts    # Stripe webhooks
│   │   │   ├── admin.routes.ts     # Admin endpoints
│   │   │   ├── setup.routes.ts     # Setup e debug
│   │   │   ├── coupon.routes.ts    # Cupons
│   │   │   └── review.routes.ts    # Reviews
│   │   ├── scripts/                 # Scripts de manutenção (22 arquivos)
│   │   │   ├── create-admin.ts
│   │   │   ├── check-admin.ts
│   │   │   ├── verify-admin.ts
│   │   │   ├── reset-admin-password.ts
│   │   │   └── [outros scripts de migração e debug]
│   │   ├── services/                # Lógica de negócios
│   │   │   ├── auth.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── admin.service.ts     # 1802 linhas, serviço principal
│   │   │   ├── coupon.service.ts
│   │   │   ├── review.service.ts
│   │   │   └── email.service.ts
│   │   ├── utils/                   # Utilitários
│   │   │   ├── imageResolver.ts    # Mapeamento de imagens
│   │   │   └── stripe.ts          # Stripe utils
│   │   ├── sentry.ts               # Configuração Sentry
│   │   └── index.ts                # Entry point do servidor
│   ├── .env.example
│   ├── package.json
│   └── drizzle.config.ts
├── src/                              # Frontend React/Vite
│   ├── api/                         # Cliente API
│   │   └── client.ts               # API helper com auto-refresh
│   ├── assets/                      # Imagens estáticas
│   │   └── products/               # Imagens de produtos (originais)
│   ├── components/                  # Componentes React
│   │   ├── ui/                     # shadcn/ui (49 componentes)
│   │   ├── BenefitsBar.tsx        # Barra de benefícios
│   │   ├── BottomNav.tsx           # Navegação mobile
│   │   ├── CartDrawer.tsx          # Drawer do carrinho
│   │   ├── CategoryShortcuts.tsx   # Atalhos de categoria
│   │   ├── CollectionsGrid.tsx     # Grid de coleções
│   │   ├── CookieBanner.tsx        # Banner de cookies
│   │   ├── CouponInput.tsx         # Input de cupom
│   │   ├── ErrorBoundary.tsx       # Error boundary
│   │   ├── Footer.tsx              # Footer
│   │   ├── Header.tsx              # Header com navegação
│   │   ├── HeroCarousel.tsx        # Carrossel hero
│   │   ├── Image.tsx               # Componente de imagem
│   │   ├── InstagramSection.tsx    # Seção Instagram
│   │   ├── Layout.tsx              # Layout principal
│   │   ├── Logo.tsx                # Logo
│   │   ├── NavLink.tsx             # Link de navegação
│   │   ├── Price.tsx               # Componente de preço
│   │   ├── ProductCard.tsx         # Card de produto
│   │   ├── ProductPageSkeleton.tsx # Skeleton loading
│   │   ├── ProductReviews.tsx      # Reviews do produto
│   │   ├── QuickView.tsx           # Quick view modal
│   │   ├── SaleBanner.tsx          # Banner de promoção
│   │   ├── SEO.tsx                 # Meta tags e JSON-LD
│   │   ├── ShippingBar.tsx         # Barra de frete grátis
│   │   ├── TopBar.tsx              # Barra superior
│   │   └── WhatsAppButton.tsx       # Botão WhatsApp
│   ├── context/                     # Contextos React
│   │   ├── CartContext.tsx         # Carrinho (localStorage)
│   │   ├── WishlistContext.tsx     # Lista de desejos (localStorage)
│   │   └── CouponContext.tsx       # Cupons (API)
│   ├── data/                        # Dados estáticos
│   │   └── products.ts             # Produtos fallback (20 produtos)
│   ├── hooks/                       # Hooks customizados
│   │   └── use-analytics.ts        # Analytics
│   ├── lib/                         # Bibliotecas
│   │   ├── supabaseClient.ts      # Cliente Supabase
│   │   └── productApi.ts          # API de produtos
│   ├── pages/                       # Páginas da aplicação
│   │   ├── admin/                  # Páginas do painel admin
│   │   │   ├── Admin.tsx          # Layout admin
│   │   │   ├── Dashboard.tsx      # Dashboard
│   │   │   ├── AdminPedidos.tsx   # Gestão de pedidos
│   │   │   ├── AdminProdutos.tsx  # Gestão de produtos
│   │   │   ├── AdminClientes.tsx  # Gestão de clientes
│   │   │   ├── AdminCupons.tsx    # Gestão de cupons
│   │   │   ├── AdminCategorias.tsx # Gestão de categorias
│   │   │   ├── AdminConjuntos.tsx # Gestão de conjuntos
│   │   │   ├── AdminConfiguracoes.tsx # Configurações
│   │   │   ├── AdminLogs.tsx       # Logs de atividade
│   │   │   ├── AdminEstoqueBaixo.tsx # Estoque baixo
│   │   │   ├── AdminAnalytics.tsx  # Analytics
│   │   │   └── FormularioProduto.tsx # Formulário CRUD produto
│   │   ├── Account.tsx             # Minha conta (login/register)
│   │   ├── Admin.tsx               # Página admin wrapper
│   │   ├── Catalog.tsx             # Catálogo de produtos
│   │   ├── Checkout.tsx            # Checkout (652 linhas)
│   │   ├── CheckoutCancel.tsx      # Cancelamento checkout
│   │   ├── CheckoutSuccess.tsx     # Sucesso checkout
│   │   ├── FAQ.tsx                 # Perguntas frequentes
│   │   ├── ForgotPassword.tsx      # Esqueci senha
│   │   ├── Index.tsx               # Home page
│   │   ├── NotFound.tsx            # 404
│   │   ├── Privacidade.tsx         # Política de privacidade
│   │   ├── ProductPage.tsx         # Página do produto
│   │   ├── QuemSomos.tsx           # Quem somos
│   │   ├── Rastreio.tsx            # Rastreamento
│   │   ├── ResetPassword.tsx       # Reset de senha
│   │   ├── Search.tsx              # Busca
│   │   ├── Termos.tsx              # Termos de uso
│   │   └── Trocas.tsx              # Trocas e devoluções
│   ├── utils/                       # Utilitários
│   │   └── shipping.ts             # Cálculo de frete
│   ├── App.tsx                     # Rotas e providers
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Estilos globais
├── supabase/                        # Configuração Supabase
│   ├── functions/                   # Edge Functions
│   │   ├── create-preference/      # Criação de pedido MP
│   │   │   └── index.ts
│   │   ├── mp-webhook/             # Webhook Mercado Pago
│   │   │   └── index.ts
│   │   └── _shared/                # Utilitários compartilhados
│   │       └── cors.ts
│   └── migrations/                  # Migrations SQL
├── .env.example                     # Exemplo env vars frontend
├── .env.local                       # Env vars frontend (não commitado)
├── package.json                     # Dependências frontend
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── tailwind.config.ts               # Configuração TailwindCSS
├── vercel.json                      # Configuração Vercel
├── README.md                        # Documentação geral
├── VERIFICACAO_DEPLOY.md           # Debug deploy
├── CACHE_FIX_FINAL.md              # Correções de cache
├── CORRECOES_AUTH_CACHE.md         # Correções auth/cache
├── CONTROLE_ESTOQUE.md             # Controle de estoque
├── CAUSA_RAIZ_IMAGENS.md           # Causa raiz imagens
├── REAL_IMAGES_FIX.md              # Fix imagens reais
├── fix-admin-access.md             # Fix acesso admin
└── FORCE_DEPLOY.md                 # Forçar deploy
```

---

## SEÇÃO 4 — Variáveis de Ambiente

### Frontend (.env.local)

| Nome | Tipo | Valor Atual/Placeholder | Configurado |
|------|------|------------------------|-------------|
| VITE_API_URL | string | https://numarstore-backend.onrender.com/api | ✅ |
| VITE_SITE_URL | string | https://numarstore-v-final.vercel.app | ✅ |
| VITE_WHATSAPP_NUMBER | string | 5521979674510 | ✅ |
| VITE_INSTAGRAM | string | https://instagram.com/use.numar | ✅ |
| VITE_LOJA_NOME | string | Numar Store | ✅ |
| VITE_DESCONTO_PIX | number | 5 | ✅ |
| VITE_GA_MEASUREMENT_ID | string | (vazio) | ⏸️ |
| VITE_SUPABASE_URL | string | your-supabase-project-url | ⏸️ |
| VITE_SUPABASE_ANON_KEY | string | your-supabase-anon-key | ⏸️ |
| VITE_STRIPE_PUBLIC_KEY | string | (comentado) | ⏸️ |
| VITE_SENTRY_DSN | string | (comentado) | ⏸️ |

### Backend (.env)

| Nome | Tipo | Valor Atual/Placeholder | Configurado |
|------|------|------------------------|-------------|
| DATABASE_URL | string | file:./numarstore.db (exemplo) | ✅ (Render PostgreSQL) |
| JWT_SECRET | string | your-jwt-secret-here-change-this | ✅ (Render) |
| JWT_REFRESH_SECRET | string | your-refresh-secret-here-change-this | ✅ (Render) |
| JWT_EXPIRES_IN | string | 7d | ✅ |
| BANDEIRA_API_URL | string | https://viacep.com.br/ws | ✅ |
| SENDGRID_API_KEY | string | SG.your-api-key-here | ⏸️ |
| SENDGRID_FROM_EMAIL | string | contato@numarstore.com.br | ✅ |
| SENDGRID_FROM_NAME | string | Numar Store | ✅ |
| FRONTEND_URL | string | https://numarstore-v-final.vercel.app | ✅ |
| BACKEND_URL | string | https://numarstore-backend.onrender.com | ✅ |
| SETUP_SECRET | string | your-setup-secret-here-change-this | ✅ |
| STRIPE_SECRET_KEY | string | (comentado) | ⏸️ |
| STRIPE_WEBHOOK_SECRET | string | (comentado) | ⏸️ |

### Supabase Edge Functions

| Nome | Tipo | Valor Atual/Placeholder | Configurado |
|------|------|------------------------|-------------|
| SUPABASE_URL | string | (configurado no painel Supabase) | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | string | (configurado no painel Supabase) | ✅ |
| MP_ACCESS_TOKEN | string | (não configurado) | ⏸️ |

---

## SEÇÃO 5 — Banco de Dados

### 5.1 PostgreSQL (Backend/Render)

**Tabela: users**
- id (TEXT, PK)
- name (TEXT, NOT NULL)
- email (TEXT, NOT NULL, UNIQUE)
- phone (TEXT)
- password_hash (TEXT, NOT NULL)
- role (TEXT, DEFAULT 'user')
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: products**
- id (TEXT, PK)
- slug (TEXT, NOT NULL, UNIQUE)
- name (TEXT, NOT NULL)
- description (TEXT, NOT NULL)
- short_description (TEXT)
- category (TEXT)
- subcategory (TEXT)
- price_pix (REAL, NOT NULL)
- price_card (REAL, NOT NULL)
- old_price (REAL)
- is_new (INTEGER, DEFAULT 0)
- is_sale (INTEGER, DEFAULT 0)
- discount (INTEGER, DEFAULT 0)
- is_active (INTEGER, DEFAULT 1)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: cart_items**
- id (SERIAL, PK)
- user_id (TEXT)
- product_id (TEXT, NOT NULL)
- color (TEXT, NOT NULL)
- size (TEXT, NOT NULL)
- quantity (INTEGER, NOT NULL, DEFAULT 1)
- UNIQUE(user_id, product_id, color, size)

**Tabela: orders**
- id (TEXT, PK)
- user_id (TEXT)
- status (TEXT, NOT NULL, DEFAULT 'pending')
- subtotal (REAL, NOT NULL)
- shipping (REAL, NOT NULL)
- discount (REAL, DEFAULT 0)
- total (REAL, NOT NULL)
- payment_method (TEXT, NOT NULL)
- name (TEXT, NOT NULL)
- email (TEXT, NOT NULL)
- cpf (TEXT)
- phone (TEXT, NOT NULL)
- cep (TEXT)
- logradouro (TEXT)
- bairro (TEXT)
- localidade (TEXT)
- uf (TEXT)
- whatsapp_msg (TEXT)
- stripe_payment_intent_id (TEXT)
- stripe_status (TEXT)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: order_items**
- id (SERIAL, PK)
- order_id (TEXT, NOT NULL)
- product_id (TEXT, NOT NULL)
- name (TEXT, NOT NULL)
- image (TEXT)
- color (TEXT, NOT NULL)
- size (TEXT, NOT NULL)
- quantity (INTEGER, NOT NULL)
- price_pix (REAL, NOT NULL)

**Tabela: payments**
- id (TEXT, PK)
- order_id (TEXT, NOT NULL)
- status (TEXT, NOT NULL, DEFAULT 'pending')
- stripe_payment_intent_id (TEXT)
- amount (REAL, NOT NULL)
- currency (TEXT, DEFAULT 'brl')
- metadata (TEXT)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: product_images**
- id (SERIAL, PK)
- product_id (TEXT, NOT NULL, FK)
- url (TEXT, NOT NULL)
- color (TEXT)
- color_hex (TEXT)
- sort_order (INTEGER, DEFAULT 0)

**Tabela: product_colors**
- id (SERIAL, PK)
- product_id (TEXT, NOT NULL, FK)
- name (TEXT, NOT NULL)
- hex (TEXT, NOT NULL)

**Tabela: product_sizes**
- id (SERIAL, PK)
- product_id (TEXT, NOT NULL, FK)
- size (TEXT, NOT NULL)

**Tabela: product_stock**
- id (SERIAL, PK)
- product_id (TEXT, NOT NULL, FK)
- color (TEXT)
- size (TEXT)
- quantity (INTEGER, DEFAULT 0)
- UNIQUE(product_id, color, size)
- FK: product_id → products(id) ON DELETE CASCADE

**Tabela: password_reset_tokens**
- id (TEXT, PK)
- user_id (TEXT, NOT NULL, FK)
- token (TEXT, NOT NULL, UNIQUE)
- expires_at (BIGINT, NOT NULL)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: coupons**
- id (TEXT, PK)
- code (TEXT, NOT NULL, UNIQUE)
- type (TEXT, NOT NULL) — 'fixed', 'percentage', 'free_shipping'
- value (REAL, NOT NULL)
- min_purchase (REAL, DEFAULT 0)
- max_discount (REAL)
- usage_limit (INTEGER)
- used_count (INTEGER, DEFAULT 0)
- valid_from (BIGINT)
- valid_until (BIGINT)
- categories (TEXT)
- products (TEXT)
- is_active (INTEGER, DEFAULT 1)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: reviews**
- id (TEXT, PK)
- product_id (TEXT, NOT NULL, FK)
- user_id (TEXT, NOT NULL, FK)
- order_id (TEXT, FK)
- rating (INTEGER, NOT NULL, CHECK 1-5)
- title (TEXT)
- comment (TEXT)
- verified_purchase (INTEGER, DEFAULT 0)
- images (TEXT, JSON)
- helpful_count (INTEGER, DEFAULT 0)
- is_approved (INTEGER, DEFAULT 0)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: activity_logs**
- id (TEXT, PK)
- user_id (TEXT, FK)
- action (TEXT, NOT NULL)
- entity_type (TEXT)
- entity_id (TEXT)
- details (TEXT)
- ip_address (TEXT)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: categories**
- id (TEXT, PK)
- name (TEXT, NOT NULL)
- slug (TEXT, NOT NULL, UNIQUE)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

**Tabela: subcategories**
- id (TEXT, PK)
- name (TEXT, NOT NULL)
- slug (TEXT, NOT NULL, UNIQUE)
- category_slug (TEXT, NOT NULL)
- created_at (BIGINT, NOT NULL, DEFAULT 0)

### 5.2 Supabase PostgreSQL

**Tabela: orders**
- id (UUID, PK)
- customer_name (TEXT)
- customer_email (TEXT)
- customer_phone (TEXT)
- total (NUMERIC)
- shipping (NUMERIC)
- payment_method (TEXT)
- status (TEXT) — 'pending', 'paid', 'cancelled'
- stripe_payment_intent_id (TEXT)
- mp_payment_id (TEXT)
- email_sent (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Tabela: order_items**
- id (UUID, PK)
- order_id (UUID, FK)
- product_id (UUID)
- product_slug (TEXT)
- product_name (TEXT)
- product_image (TEXT)
- color (TEXT)
- size (TEXT)
- quantity (INTEGER)
- price_pix (NUMERIC)
- price_card (NUMERIC)

### 5.3 Supabase Storage

**Bucket: product-images**
- Público: ✅
- Limite: 50MB por arquivo
- MIME types: image/jpeg, image/png, image/webp
- RLS: Leitura pública, escrita para autenticados
- Status: Configurado mas não utilizado atualmente

### 5.4 Decisões Técnicas de Banco

**Por que dois bancos?**
- PostgreSQL (backend): Dados principais do sistema, usuários, produtos, carrinho, pedidos locais
- Supabase PostgreSQL: Pedidos criados via Edge Functions para integração com Mercado Pago e envio de emails

**O que fica em cada um?**
- Backend PostgreSQL: Tudo exceto pedidos finais que precisam de integração externa
- Supabase PostgreSQL: Pedidos criados via checkout, itens do pedido, status de pagamento

---

## SEÇÃO 6 — Rotas Frontend

### Rotas Públicas

| Path | Componente | Arquivo | Propósito |
|------|------------|---------|-----------|
| / | Index | src/pages/Index.tsx | Home page com hero, categorias, produtos em destaque |
| /catalogo | Catalog | src/pages/Catalog.tsx | Catálogo geral de produtos |
| /catalogo/:categoria | Catalog | src/pages/Catalog.tsx | Catálogo filtrado por categoria |
| /produto/:slug | ProductPage | src/pages/ProductPage.tsx | Página de detalhes do produto |
| /conta | Account | src/pages/Account.tsx | Login, registro, perfil, pedidos, favoritos |
| /busca | Search | src/pages/Search.tsx | Busca de produtos |
| /checkout | Checkout | src/pages/Checkout.tsx | Checkout em 3 etapas |
| /checkout/success | CheckoutSuccess | src/pages/CheckoutSuccess.tsx | Página de sucesso após pedido |
| /forgot-password | ForgotPassword | src/pages/ForgotPassword.tsx | Solicitação de reset de senha |
| /reset-password | ResetPassword | src/pages/ResetPassword.tsx | Reset de senha com token |
| /rastreio | Rastreio | src/pages/Rastreio.tsx | Rastreamento de pedidos |
| /quem-somos | QuemSomos | src/pages/QuemSomos.tsx | Sobre a loja |
| /privacidade | Privacidade | src/pages/Privacidade.tsx | Política de privacidade |
| /termos | Termos | src/pages/Termos.tsx | Termos de uso |
| /trocas-e-devolucoes | Trocas | src/pages/Trocas.tsx | Política de trocas |
| /faq | FAQ | src/pages/FAQ.tsx | Perguntas frequentes |
| * | NotFound | src/pages/NotFound.tsx | Página 404 |

### Rotas Protegidas (Admin)

| Path | Componente | Arquivo | Propósito |
|------|------------|---------|-----------|
| /admin | AdminRoute | src/pages/admin/Admin.tsx | Layout admin com sidebar |
| /admin (index) | Dashboard | src/pages/admin/Dashboard.tsx | Dashboard com analytics |
| /admin/pedidos | AdminPedidos | src/pages/admin/AdminPedidos.tsx | Gestão de pedidos |
| /admin/produtos | AdminProdutos | src/pages/admin/AdminProdutos.tsx | Gestão de produtos |
| /admin/clientes | AdminClientes | src/pages/admin/AdminClientes.tsx | Gestão de clientes |
| /admin/cupons | AdminCupons | src/pages/admin/AdminCupons.tsx | Gestão de cupons |
| /admin/categorias | AdminCategorias | src/pages/admin/AdminCategorias.tsx | Gestão de categorias |
| /admin/conjuntos | AdminConjuntos | src/pages/admin/AdminConjuntos.tsx | Gestão de conjuntos |
| /admin/configuracoes | AdminConfiguracoes | src/pages/admin/AdminConfiguracoes.tsx | Configurações da loja |
| /admin/logs | AdminLogs | src/pages/admin/AdminLogs.tsx | Logs de atividade |
| /admin/estoque-baixo | AdminEstoqueBaixo | src/pages/admin/AdminEstoqueBaixo.tsx | Produtos com estoque baixo |
| /admin/analytics | AdminAnalytics | src/pages/admin/AdminAnalytics.tsx | Analytics detalhados |

---

## SEÇÃO 7 — Contextos React

### CartContext

**Estado:**
- items: CartItem[]
- isOpen: boolean
- subtotal: number
- count: number

**Ações:**
- addItem(product, color, size, qty): Promise<void>
- removeItem(id): Promise<void>
- updateQty(id, qty): Promise<void>
- clear(): Promise<void>
- loadCart(): Promise<void>
- open(): void
- close(): void
- toggle(): void

**Persistência:** localStorage (chave: "numar.cart")  
**Dependências:** Nenhuma (apenas React)

### WishlistContext

**Estado:**
- items: Product[]

**Ações:**
- addToWishlist(product): void
- removeFromWishlist(id): void
- isInWishlist(id): boolean

**Persistência:** localStorage (chave: "numar.wishlist")  
**Dependências:** Nenhuma (apenas React)

### CouponContext

**Estado:**
- appliedCoupon: Coupon | null
- discount: number

**Ações:**
- applyCoupon(code, subtotal): Promise<{ valid: boolean, error?: string }>
- removeCoupon(): void

**Persistência:** Estado em memória (não persiste)  
**Dependências:** API backend (/api/coupons/validate)

---

## SEÇÃO 8 — Componentes

### 8.1 Componentes Customizados

| Arquivo | Propósito | Onde é Usado |
|---------|-----------|--------------|
| BenefitsBar.tsx | Barra de benefícios (frete grátis, etc) | Layout |
| BottomNav.tsx | Navegação inferior mobile | Layout mobile |
| CartDrawer.tsx | Drawer lateral do carrinho | Header |
| CategoryShortcuts.tsx | Atalhos de categoria na home | Index |
| CollectionsGrid.tsx | Grid de coleções na home | Index |
| CookieBanner.tsx | Banner de consentimento de cookies | Layout |
| CouponInput.tsx | Input para aplicar cupom | Checkout |
| ErrorBoundary.tsx | Error boundary global | App |
| Footer.tsx | Footer com links e redes sociais | Layout |
| Header.tsx | Header com navegação e carrinho | Layout |
| HeroCarousel.tsx | Carrossel hero na home | Index |
| Image.tsx | Componente de imagem com fallback | ProductPage, ProductCard |
| InstagramSection.tsx | Seção Instagram na home | Index |
| Layout.tsx | Layout wrapper com header/footer | Todas as páginas |
| Logo.tsx | Logo Numar Store | Header, Footer |
| NavLink.tsx | Link de navegação com estilo | Header |
| Price.tsx | Componente de preço (PIX/Card) | ProductCard, ProductPage |
| ProductCard.tsx | Card de produto | Catalog, Index |
| ProductPageSkeleton.tsx | Skeleton loading página produto | ProductPage |
| ProductReviews.tsx | Reviews do produto | ProductPage |
| QuickView.tsx | Modal de visualização rápida | ProductCard |
| SaleBanner.tsx | Banner de promoção | Index |
| SEO.tsx | Meta tags e JSON-LD | Todas as páginas |
| ShippingBar.tsx | Barra de frete grátis | Layout |
| TopBar.tsx | Barra superior | Header |
| WhatsAppButton.tsx | Botão flutuante WhatsApp | Layout |

### 8.2 shadcn/ui Instalados

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip (49 componentes)

---

## SEÇÃO 9 — Páginas

### Páginas Públicas

| Arquivo | Rota | Propósito | Componentes Principais | Dependências API | Estado |
|--------|------|-----------|----------------------|------------------|--------|
| Index.tsx | / | Home page | HeroCarousel, CategoryShortcuts, BenefitsBar, CollectionsGrid, SaleBanner, InstagramSection | /api/products (featured) | ✅ |
| Catalog.tsx | /catalogo, /catalogo/:categoria | Catálogo de produtos | ProductCard, filtros de preço/cor/tamanho | /api/products, /api/subcategories | ✅ |
| ProductPage.tsx | /produto/:slug | Detalhes do produto | Image, ProductReviews, accordions | /api/products/:slug, /api/reviews/product/:id | ✅ |
| Checkout.tsx | /checkout | Checkout em 3 etapas | CouponInput, formulários, opções de frete | /api/cep, Supabase create-preference | ✅ |
| CheckoutSuccess.tsx | /checkout/success | Sucesso após pedido | - | - | ✅ |
| Account.tsx | /conta | Login, registro, perfil, pedidos, favoritos | Formulários, Tabs | /api/auth/login, /api/auth/register, /api/orders | ✅ |
| Search.tsx | /busca | Busca de produtos | ProductCard | /api/products/search | ✅ |
| ForgotPassword.tsx | /forgot-password | Solicitação de reset | Formulário | /api/auth/forgot-password | ✅ |
| ResetPassword.tsx | /reset-password | Reset de senha | Formulário | /api/auth/reset-password | ✅ |
| Rastreio.tsx | /rastreio | Rastreamento de pedidos | Formulário | - | ✅ |
| QuemSomos.tsx | /quem-somos | Sobre a loja | - | - | ✅ |
| Privacidade.tsx | /privacidade | Política de privacidade | - | - | ✅ |
| Termos.tsx | /termos | Termos de uso | - | - | ✅ |
| Trocas.tsx | /trocas-e-devoluções | Política de trocas | - | - | ✅ |
| FAQ.tsx | /faq | Perguntas frequentes | Accordion | - | ✅ |
| CheckoutCancel.tsx | NÃO ENCONTRADO | Cancelamento checkout | - | - | ❌ |
| NotFound.tsx | * | Página 404 | - | - | ✅ |

### Páginas Admin

| Arquivo | Rota | Propósito | Componentes Principais | Dependências API | Estado |
|--------|------|-----------|----------------------|------------------|--------|
| Admin.tsx | /admin | Layout admin com sidebar | Sidebar, Outlet | /api/auth/profile | ✅ |
| Dashboard.tsx | /admin (index) | Dashboard com analytics | Charts, Cards | /api/admin/dashboard | ✅ |
| AdminPedidos.tsx | /admin/pedidos | Gestão de pedidos | Table, Status badges | /api/admin/orders | ✅ |
| AdminProdutos.tsx | /admin/produtos | Gestão de produtos | Table, ProductCard | /api/admin/products | ✅ |
| AdminClientes.tsx | /admin/clientes | Gestão de clientes | Table | /api/admin/customers | ✅ |
| AdminCupons.tsx | /admin/cupons | Gestão de cupons | Table, Form | /api/admin/coupons | ✅ |
| AdminCategorias.tsx | /admin/categorias | Gestão de categorias | Table, Form | /api/admin/categories | ✅ |
| AdminConjuntos.tsx | /admin/conjuntos | Gestão de conjuntos | Table, Form | /api/admin/bundles | ✅ |
| AdminConfiguracoes.tsx | /admin/configuracoes | Configurações da loja | Form | /api/admin/settings | ✅ |
| AdminLogs.tsx | /admin/logs | Logs de atividade | Table | /api/admin/logs | ✅ |
| AdminEstoqueBaixo.tsx | /admin/estoque-baixo | Produtos estoque baixo | Table | /api/admin/low-stock | ✅ |
| AdminAnalytics.tsx | /admin/analytics | Analytics detalhados | Charts | /api/admin/analytics | ✅ |
| FormularioProduto.tsx | - | Formulário CRUD produto | Form, Image upload, Stock table | /api/admin/products | ✅ |

---

## SEÇÃO 10 — Backend API

### Autenticação (/api/auth)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| POST | /register | Público | Registro de usuário | { name, email, phone, password } | { token, refreshToken, user } |
| POST | /login | Público | Login | { email, password } | { token, refreshToken, user } |
| POST | /refresh | Público | Refresh access token | { refreshToken } | { token, refreshToken } |
| GET | /profile | Autenticado | Perfil do usuário | - | { user } |
| PUT | /profile | Autenticado | Atualizar perfil | { name, phone } | { user } |
| POST | /forgot-password | Público | Solicitar reset de senha | { email } | { message } |
| POST | /reset-password | Público | Resetar senha com token | { token, password } | { message } |

### Produtos (/api/products)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| GET | / | Público | Listar produtos (filtros: category, price, search, sort) | Query params | { products[] } |
| GET | /search | Público | Buscar produtos | Query: q | { products[] } |
| GET | /:slug | Público | Detalhes do produto | - | { product } |
| GET | /:slug/related | Público | Produtos relacionados | - | { products[] } |
| GET | /:slug/stock | Público | Verificar estoque | Query: color, size | { available, quantity } |

### Pedidos (/api/orders)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| POST | / | Público/Autenticado | Criar pedido | { items, customer, shipping, paymentMethod } | { order } |
| GET | / | Autenticado | Listar pedidos do usuário | - | { orders[] } |
| GET | /:id | Autenticado | Detalhes do pedido | - | { order } |

### Cupons (/api/coupons)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| POST | /validate | Público | Validar cupom | { code, subtotal } | { valid, coupon, error } |
| POST | / | Admin | Criar cupom | { code, type, value, min_purchase, ... } | { coupon } |
| GET | / | Admin | Listar cupons | - | { coupons[] } |
| PUT | /:id | Admin | Atualizar cupom | Partial<Coupon> | { coupon } |
| DELETE | /:id | Admin | Deletar cupom | - | { success } |

### Reviews (/api/reviews)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| GET | /product/:productId | Público | Reviews do produto | - | { reviews[] } |
| GET | /rating/:productId | Público | Rating médio | - | { average, count } |
| POST | / | Autenticado | Criar review | { product_id, rating, title, comment } | { review } |
| POST | /:id/helpful | Público | Marcar como útil | - | { success } |
| GET | / | Admin | Listar todas reviews | - | { reviews[] } |
| PUT | /:id/approve | Admin | Aprovar review | - | { success } |
| DELETE | /:id | Admin | Deletar review | - | { success } |

### Pagamentos (/api/payments)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| POST | /create-checkout-session | Autenticado | Criar sessão Stripe | { items, success_url, cancel_url } | { sessionId, url } |
| POST | / | Autenticado | Criar pagamento | { order_id, amount, method } | { payment } |
| GET | /:id/status | Autenticado | Status do pagamento | - | { status } |
| POST | /:id/confirm | Autenticado | Confirmar pagamento | - | { success } |
| POST | /webhook | Público | Webhook Stripe | Stripe event | { received } |

### Admin (/api/admin)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| GET | /dashboard | Admin | Dashboard analytics | - | { totalSales, ordersToday, ... } |
| GET | /analytics | Admin | Analytics detalhados | Query: period | { revenueChart, topProducts, ... } |
| GET | /orders | Admin | Listar pedidos | Query: status, page | { orders[], total } |
| GET | /orders/:id | Admin | Detalhes do pedido | - | { order } |
| PUT | /orders/:id/status | Admin | Atualizar status | { status } | { order } |
| GET | /products | Admin | Listar produtos | Query: page, category | { products[], total } |
| GET | /products/:id | Admin | Detalhes do produto | - | { product } |
| POST | /products | Admin | Criar produto | Product data | { product } |
| PUT | /products/:id | Admin | Atualizar produto | Partial<Product> | { product } |
| DELETE | /products/:id | Admin | Deletar produto | - | { success } |
| POST | /products/:id/images | Admin | Adicionar imagens | { url, color, color_hex } | { image } |
| DELETE | /products/:id/images/:imageId | Admin | Remover imagem | - | { success } |
| PUT | /products/:id/stock | Admin | Atualizar estoque | { stock } | { success } |
| GET | /products/:id/stock | Admin | Ver estoque | - | { stock } |
| GET | /customers | Admin | Listar clientes | Query: page | { customers[], total } |
| GET | /customers/:id | Admin | Detalhes do cliente | - | { customer } |
| PUT | /customers/:id | Admin | Atualizar cliente | Partial<Customer> | { customer } |
| DELETE | /customers/:id | Admin | Deletar cliente | - | { success } |
| GET | /bundles | Admin | Listar conjuntos | Query: page | { bundles[], total } |
| GET | /bundles/:id | Admin | Detalhes do bundle | - | { bundle } |
| POST | /bundles | Admin | Criar bundle | Bundle data | { bundle } |
| PUT | /bundles/:id | Admin | Atualizar bundle | Partial<Bundle> | { bundle } |
| DELETE | /bundles/:id | Admin | Deletar bundle | - | { success } |
| GET | /coupons | Admin | Listar cupons | - | { coupons[] } |
| GET | /coupons/:id | Admin | Detalhes do cupom | - | { coupon } |
| POST | /coupons | Admin | Criar cupom | Coupon data | { coupon } |
| PUT | /coupons/:id | Admin | Atualizar cupom | Partial<Coupon> | { coupon } |
| DELETE | /coupons/:id | Admin | Deletar cupom | - | { success } |
| GET | /categories | Admin | Listar categorias | - | { categories[] } |
| POST | /categories | Admin | Criar categoria | { name, slug } | { category } |
| DELETE | /categories/:id | Admin | Deletar categoria | - | { success } |
| GET | /subcategories/:categorySlug | Admin | Listar subcategorias | - | { subcategories[] } |
| POST | /subcategories | Admin | Criar subcategoria | { name, slug, category_slug } | { subcategory } |
| DELETE | /subcategories/:id | Admin | Deletar subcategoria | - | { success } |
| GET | /settings | Admin | Configurações da loja | - | { settings } |
| PUT | /settings | Admin | Atualizar configurações | { settings } | { settings } |
| GET | /logs | Admin | Logs de atividade | Query: page, user_id | { logs[], total } |
| GET | /low-stock | Admin | Produtos estoque baixo | - | { products[] } |

### CEP (/api/cep)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| GET | /:cep | Público | Buscar endereço via ViaCEP | - | { logradouro, bairro, localidade, uf } |

### Setup (/api/setup)

| Método | Path | Auth | O que faz | Request Body | Response |
|--------|------|------|-----------|--------------|----------|
| POST | / | Público | Setup inicial (criar admin) | { secret, email, password } | { success } |
| GET | /check-admin | Público | Verificar se admin existe | - | { exists, email } |
| POST | /create-admin | Público | Criar admin (com secret) | { secret, email, password } | { success } |
| GET | /debug-products | Público | Debug de produtos | - | { product, imagesCount, images } |
| GET | /debug-jwt | Público | Debug JWT config | - | { jwtSecretConfigured, ... } |
| POST | /update-image-urls | Público | Atualizar URLs de imagens | - | { updated } |

---

## SEÇÃO 11 — Serviços Backend

### auth.service.ts

- `registerUser(data)` — Registro com hash de senha
- `loginUser(email, password)` — Login com verificação e geração de JWTs
- `getUserById(id)` — Buscar usuário por ID
- `updateUser(id, data)` — Atualizar dados do usuário
- `createPasswordResetToken(userId)` — Criar token de reset
- `resetPassword(token, newPassword)` — Resetar senha com token
- `verifyResetToken(token)` — Verificar validade do token

### product.service.ts

- `getAllProducts(filters)` — Listar produtos com filtros
- `getProductBySlug(slug)` — Buscar produto por slug
- `getProductById(id)` — Buscar produto por ID
- `getRelatedProducts(slug, limit)` — Produtos relacionados
- `searchProducts(query)` — Busca de produtos
- `checkStock(productId, color, size)` — Verificar estoque

### admin.service.ts (1802 linhas)

- `getDashboard()` — Analytics do dashboard (vendas, pedidos hoje, produtos, ticket médio, gráfico 7 dias, pedidos recentes, produtos top)
- `getAnalytics(period)` — Analytics detalhados (receita, produtos top, vendas por categoria, gráfico de receita)
- `getOrders(filters)` — Listar pedidos com filtros
- `getOrderById(id)` — Detalhes do pedido
- `updateOrderStatus(id, status)` — Atualizar status do pedido
- `getProducts(filters)` — Listar produtos admin
- `getProductById(id)` — Detalhes do produto admin
- `createProduct(data)` — Criar produto
- `updateProduct(id, data)` — Atualizar produto
- `deleteProduct(id)` — Deletar produto
- `addProductImages(id, images)` — Adicionar imagens
- `removeProductImage(id, imageId)` — Remover imagem
- `updateProductStock(id, stock)` — Atualizar estoque
- `getProductStock(id)` — Ver estoque
- `getCustomers(filters)` — Listar clientes
- `getCustomerById(id)` — Detalhes do cliente
- `updateCustomer(id, data)` — Atualizar cliente
- `deleteCustomer(id)` — Deletar cliente
- `getBundles(filters)` — Listar bundles
- `getBundleById(id)` — Detalhes do bundle
- `createBundle(data)` — Criar bundle
- `updateBundle(id, data)` — Atualizar bundle
- `deleteBundle(id)` — Deletar bundle
- `getCoupons()` — Listar cupons
- `getCouponById(id)` — Detalhes do cupom
- `createCoupon(data)` — Criar cupom
- `updateCoupon(id, data)` — Atualizar cupom
- `deleteCoupon(id)` — Deletar cupom
- `getCategories()` — Listar categorias
- `addCategory(data)` — Criar categoria
- `deleteCategory(id)` — Deletar categoria
- `getStoreSettings()` — Configurações da loja
- `updateStoreSettings(data)` — Atualizar configurações
- `getActivityLogs(filters)` — Logs de atividade
- `getLowStockProducts()` — Produtos com estoque baixo
- `getSubcategories(categorySlug)` — Listar subcategorias
- `createSubcategory(data)` — Criar subcategoria
- `deleteSubcategory(id)` — Deletar subcategoria

### coupon.service.ts

- `createCoupon(data)` — Criar cupom
- `getCouponByCode(code)` — Buscar cupom por código
- `validateCoupon(code, subtotal, productIds, category)` — Validar cupom
- `calculateDiscount(coupon, subtotal, shipping)` — Calcular desconto
- `incrementCouponUsage(code)` — Incrementar uso
- `getAllCoupons()` — Listar cupons
- `updateCoupon(id, data)` — Atualizar cupom
- `getCouponById(id)` — Buscar por ID
- `deleteCoupon(id)` — Deletar cupom

### review.service.ts

- `createReview(data)` — Criar review
- `getReviewsByProductId(productId, approvedOnly)` — Reviews do produto
- `getReviewById(id)` — Review por ID
- `getProductRating(productId)` — Rating médio
- `approveReview(id)` — Aprovar review
- `deleteReview(id)` — Deletar review
- `markHelpful(id)` — Marcar como útil
- `getAllReviews(approvedOnly)` — Listar todas

### email.service.ts

- `sendEmail(data)` — Enviar email genérico
- `sendWelcomeEmail(email, name)` — Email de boas-vindas
- `sendOrderConfirmationEmail(email, name, orderId, total, items)` — Confirmação de pedido
- `sendPasswordResetEmail(email, resetLink)` — Reset de senha
- `sendCartAbandonmentEmail(email, name, itemCount, total)` — Carrinho abandonado

---

## SEÇÃO 12 — Sistema de Imagens

### Como Funciona o Mapeamento

**Arquivo:** `backend/src/utils/imageResolver.ts`

**Mapeamento Manual (PRODUCT_IMAGE_MAP):**
- slug → cor → nome do arquivo
- Exemplo: "biquini-amarelo" → "Amarelo" → "biquini-amarelo.jpeg"
- 18 produtos mapeados com 3-4 cores cada

**Resolução de Imagens:**
1. Tenta encontrar no mapeamento manual (slug + cor)
2. Se não encontrar, busca por nome do arquivo no sistema
3. Usa termos de busca de cor para encontrar correspondência
4. Se URL já for absoluta, retorna direto
5. Se URL começar com "/images/", converte para URL absoluta do backend

**Geração de URLs:**
- URLs relativas `/images/...` → `https://numarstore-backend.onrender.com/images/...`
- Backend serve arquivos estáticos via `express.static("public")`
- Pasta: `backend/public/images/` (153 arquivos de imagem)

**Limitações Conhecidas:**
- Mapeamento manual precisa ser atualizado ao adicionar novos produtos
- Sistema de fallback por nome pode não funcionar se nomes forem muito diferentes
- Cache de arquivos precisa ser limpo ao adicionar novas imagens

**Problemas Corrigidos:**
1. URLs relativas no banco não funcionavam → Convertidas para URLs absolutas do backend
2. Service worker cacheava versões antigas → Desabilitado e desregistrado
3. Imagens não apareciam → Backend configurado para servir arquivos estáticos
4. Placeholders rosa usados temporariamente → Substituídos por imagens reais

---

## SEÇÃO 13 — Supabase Edge Functions

### create-preference

**Arquivo:** `supabase/functions/create-preference/index.ts`

**Propósito:** Criar pedido no Supabase e preferência de pagamento no Mercado Pago

**Request:**
```json
{
  "customer": { "name": "string", "email": "string", "phone": "string" },
  "items": [
    {
      "productId": "string",
      "slug": "string",
      "name": "string",
      "image": "string",
      "pricePix": number,
      "priceCard": number,
      "color": "string",
      "size": "string",
      "quantity": number
    }
  ],
  "shipping": number,
  "paymentMethod": "pix" | "card"
}
```

**Response:**
```json
{
  "order_id": "uuid",
  "init_point": null,
  "preference_id": null,
  "whatsapp_redirect": true
}
```

**Fluxo de Execução:**
1. Recebe dados do pedido via POST
2. Calcula total baseado no método de pagamento
3. Insere pedido na tabela orders (Supabase)
4. Insere itens na tabela order_items (Supabase)
5. Retorna order_id e flag whatsapp_redirect: true
6. Frontend redireciona para WhatsApp com resumo do pedido

**Estado Atual:** ✅ Ativo, mas sem integração real com Mercado Pago (retorna init_point: null)

### mp-webhook

**Arquivo:** `supabase/functions/mp-webhook/index.ts`

**Propósito:** Receber notificações do Mercado Pago e atualizar status do pedido

**Request:**
```json
{
  "type": "payment",
  "data": { "id": "payment_id" }
}
```

**Fluxo de Execução:**
1. Recebe webhook do Mercado Pago
2. Busca detalhes do pagamento na API do MP
3. Mapeia status: approved → paid, pending → pending, rejected → cancelled
4. Atualiza pedido no Supabase com mp_payment_id e status
5. Se status = paid, invoca send-confirmation-email
6. Marca email_sent = true
7. Retorna 200 rapidamente

**Estado Atual:** ⏸️ Preparado, mas Mercado Pago não configurado com chaves reais

---

## SEÇÃO 14 — Fluxo de Checkout e Pagamento

### Etapas do Checkout

**Etapa 1: Dados Pessoais e Pagamento**
- Nome, sobrenome, email, CPF, telefone
- Seleção de método: PIX ou Cartão
- Banner verde explicando fluxo WhatsApp
- Aplicação de cupom (opcional)

**Etapa 2: Endereço de Entrega**
- CEP com busca automática (ViaCEP)
- Logradouro, número, complemento
- Bairro, cidade, estado
- Cálculo de frete após CEP

**Etapa 3: Resumo e Confirmação**
- Lista de itens do carrinho
- Opções de frete (PAC, SEDEX, Entrega própria)
- Resumo de valores (subtotal, frete, desconto, total)
- Botão "Finalizar Compra"

### Cálculo de Frete

**Regiões e Preços:**
- RJ (Rio de Janeiro): PAC R$15, SEDEX R$25
- Sudeste (SP, MG, ES): PAC R$20, SEDEX R$35
- Outros estados: PAC R$28, SEDEX R$45
- Entrega própria Campo Grande RJ (CEP 232xxx): Grátis

**Regra de Frete Grátis:**
- Frete grátis para compras acima de R$299
- Aplica a todas as regiões

**Cálculo por Peso:**
- Adiciona R$2 por kg acima de 1kg (PAC)
- Adiciona R$3 por kg acima de 1kg (SEDEX)

### Cupons

**Tipos Suportados:**
- `fixed`: Valor fixo de desconto
- `percentage`: Porcentagem de desconto
- `free_shipping`: Frete grátis

**Validações:**
- Valor mínimo de compra
- Limite de uso
- Validade (data início/fim)
- Aplicação a categorias específicas
- Aplicação a produtos específicos

### Fluxo ao Confirmar Pedido

1. Valida todos os campos obrigatórios
2. Chama Supabase Edge Function `create-preference`
3. Envia: customer, items, shipping, paymentMethod, address
4. Recebe: order_id, whatsapp_redirect: true
5. Limpa carrinho (localStorage)
6. Monta mensagem WhatsApp:
   - Pedido #order_id
   - Lista de itens com cor, tamanho, quantidade
   - Total
   - Nome e email do cliente
7. Abre WhatsApp com mensagem formatada
8. Redireciona para `/checkout/success?order_id=...`

### Formato da Mensagem WhatsApp

```
Olá! Acabei de fazer um pedido no site.

*Pedido #ABC12345*
• Produto 1 (Vermelho, P) x2
• Produto 2 (Azul, M) x1

*Total: R$ 250.00*

Nome: João Silva
Email: joao@email.com
```

### Estado do Mercado Pago e Stripe

**Mercado Pago:**
- Edge functions criadas (create-preference, mp-webhook)
- Sem chaves reais configuradas (MP_ACCESS_TOKEN)
- Fluxo atual: WhatsApp apenas

**Stripe:**
- Integrado no backend (routes/payment.routes.ts, stripe.routes.ts)
- Chaves comentadas no .env
- Não ativo

---

## SEÇÃO 15 — Autenticação

### Fluxo de Login/Register

**Register:**
1. Usuário preenche nome, email, telefone, senha
2. Frontend chama POST /api/auth/register
3. Backend hash senha com bcrypt
4. Insere usuário no banco com role 'user'
5. Retorna access token (7 dias) e refresh token (30 dias)
6. Frontend salva tokens no localStorage
7. Redireciona para home

**Login:**
1. Usuário preenche email, senha
2. Frontend chama POST /api/auth/login
3. Backend busca usuário por email
4. Verifica senha com bcrypt
5. Gera access token e refresh token
6. Retorna tokens + dados do usuário
7. Frontend salva no localStorage
8. Se role = 'admin', redireciona para /admin
9. Caso contrário, redireciona para /

### Estrutura do JWT

**Access Token:**
- Expiração: 7 dias (604800 segundos)
- Contém: { userId, email, role }
- Usado em: Authorization header

**Refresh Token:**
- Expiração: 30 dias (2592000 segundos)
- Contém: { userId }
- Usado para: Obter novo access token

### Auto-Refresh no api/client.ts

**Lógica:**
1. Tenta requisição com access token
2. Se receber 401 (Unauthorized):
   - Chama POST /api/auth/refresh com refresh token
   - Recebe novo access token
   - Repete requisição original
3. Se refresh falhar:
   - Limpa localStorage
   - Redireciona para /conta

### Armazenamento de Tokens

**localStorage:**
- `numar.token` — Access token
- `numar.refreshToken` — Refresh token
- `numar.user` — Dados do usuário (JSON)

### Middleware de Admin

**authMiddleware:**
- Verifica Authorization header
- Decodifica JWT
- Adiciona req.user ao request
- Retorna 401 se token inválido

**adminMiddleware:**
- Usa authMiddleware
- Verifica se req.user.role === 'admin'
- Retorna 403 se não for admin

**AdminRoute (frontend):**
- Verifica se token existe no localStorage
- Se não existe, redireciona para /conta
- Verificação de role feita no Admin.tsx

### Fluxo de Reset de Senha

1. Usuário solicita reset em /forgot-password
2. Frontend chama POST /api/auth/forgot-password com email
3. Backend gera token aleatório
4. Insere em password_reset_tokens com expiração (1 hora)
5. Envia email com link de reset (via SendGrid)
6. Usuário clica no link → /reset-password?token=...
7. Frontend chama POST /api/auth/reset-password com token e nova senha
8. Backend verifica validade do token
9. Atualiza senha do usuário
10. Deleta token
11. Redireciona para /conta

---

## SEÇÃO 16 — Frete

### Tabela de Preços por Região

| Região | PAC | SEDEX | Condição |
|-------|-----|-------|----------|
| RJ | R$15 | R$25 | CEP com DDD 21, 22, 24 |
| Sudeste | R$20 | R$35 | SP, MG, ES (DDD 11-19, 27-28, 31-38, 41-46) |
| Outros | R$28 | R$45 | Todos os outros estados |

### Regra de Frete Grátis

- **Condição:** Valor total ≥ R$299
- **Aplica:** Todas as regiões
- **Exceção:** Entrega própria Campo Grande RJ (sempre grátis)

### Determinação da Região por CEP

**Lógica:**
1. Extrai 3 primeiros dígitos do CEP (DDD)
2. Mapeia DDD → estado
3. Se estado = RJ → região RJ
4. Se estado em [SP, MG, ES] → região Sudeste
5. Caso contrário → região Outros

**Mapeamento DDD → Estado:**
- RJ: 21, 22, 24
- SP: 11-19
- MG: 31-38
- ES: 27, 28
- Outros: todos os outros DDDs

### Entrega Própria Campo Grande RJ

**Condição:** CEP começa com 232 (Campo Grande, RJ)
**Opção:** "Entrega Própria - Campo Grande RJ"
**Preço:** Grátis
**Prazo:** 1-2 dias úteis
**Link:** Redireciona para WhatsApp

---

## SEÇÃO 17 — Funcionalidades por Status

### ✅ Funcionalidades Ativas e Funcionando

- **Catálogo de produtos** com filtros (categoria, preço, cor, tamanho, ordenação)
- **Busca de produtos** por nome
- **Página de produto** com galeria, seleção cor/tamanho, reviews
- **Carrinho de compras** (localStorage) com add/remove/update
- **Lista de desejos** (localStorage)
- **Checkout em 3 etapas** com cálculo de frete
- **Cálculo de frete** por região com regra de frete grátis
- **Cupons de desconto** (validação, aplicação, tipos: fixed, percentage, free_shipping)
- **Autenticação** (login, registro, recuperação de senha)
- **Minha conta** (perfil, pedidos, favoritos)
- **Painel admin completo** (dashboard, produtos, pedidos, clientes, cupons, categorias, conjuntos, logs, analytics)
- **Gestão de produtos** (CRUD, imagens, estoque por cor/tamanho)
- **Gestão de pedidos** (listar, detalhes, atualizar status)
- **Gestão de clientes** (listar, detalhes, atualizar, deletar)
- **Gestão de cupons** (CRUD completo)
- **Gestão de categorias/subcategorias** (CRUD)
- **Gestão de conjuntos/bundles** (CRUD)
- **Controle de estoque** por cor e tamanho
- **Reviews** (criação, aprovação admin, marcação útil)
- **Analytics dashboard** (vendas, pedidos, produtos top, gráficos)
- **Logs de atividade** (auditoria de ações)
- **Alertas de estoque baixo**
- **Integração WhatsApp** no checkout
- **Busca de CEP** via ViaCEP
- **Imagens de produtos** servidas pelo backend
- **Páginas informativas** (quem somos, termos, privacidade, trocas, FAQ, rastreio)

### ⚠️ Funcionalidades com Problemas Conhecidos

- **Imagens de produtos** — URLs foram convertidas para placeholders temporariamente durante debug, depois restauradas para imagens reais servidas pelo backend. Cache do navegador pode causar problemas.
- **Service worker** — Foi desabilitado para resolver problemas de cache. Pode ainda estar registrado em navegadores antigos.
- **SendGrid emails** — Configurado mas pode não estar enviando (chave API placeholder).
- **Mercado Pago** — Edge functions criadas mas sem chaves reais, retorna apenas order_id sem init_point.

### ⏸️ Funcionalidades Preparadas mas Inativas

- **Mercado Pago** — Edge functions criadas (create-preference, mp-webhook), mas sem chaves de acesso reais. Fluxo atual usa apenas WhatsApp.
- **Stripe** — Integrado no backend (routes, utils), mas chaves comentadas no .env.
- **SendGrid emails** — Configurado no backend (email.service.ts), mas SENDGRID_API_KEY pode estar placeholder.

### 🚫 Funcionalidades Não Implementadas

- **Carrinho sincronizado com backend** — Atualmente usa apenas localStorage, sem persistência no banco.
- **Carrinho abandonado** — Email de carrinho abandonado preparado mas não automatizado.
- **Rastreamento de pedidos** — Página existe mas sem integração real com transportadoras.
- **Pagamento via PIX no site** — Apenas redireciona para WhatsApp, não gera QR code PIX.
- **Pagamento via cartão no site** — Apenas redireciona para WhatsApp, não integra com gateway.
- **Upload de imagens** — Supabase Storage configurado mas sem UI de upload.
- **Chat ao vivo** — Não implementado.
- **Testes automatizados** — Vitest configurado mas sem testes escritos.

---

## SEÇÃO 18 — Histórico de Problemas Resolvidos

### Problema de Cache/Service Worker

**Problema:** Service worker cacheava TODAS as requisições HTTP, incluindo chamadas de API, causando respostas de login cacheadas, tokens obsoletos e necessidade de limpar cache manualmente.

**Solução:**
- Adicionado filtro no service worker para NÃO cachear requisições de API (`/api/`)
- Desabilitado temporariamente o registro do service worker em `src/main.tsx`
- Adicionado código para desregistrar service workers existentes

**Arquivos Modificados:**
- `public/sw.js` — Filtros para não cachear API/auth
- `src/main.tsx` — Service worker desabilitado

### Problemas de Imagens em Produção

**Problema:** Imagens não apareciam porque URLs eram relativas (`/images/...`) e não correspondiam a arquivos reais. Service worker cacheava versões antigas.

**Solução:**
- Backend configurado para servir arquivos estáticos via `express.static("public")`
- Imagens copiadas para `backend/public/images/` (153 arquivos)
- Admin service converte URLs relativas para URLs absolutas do backend
- Endpoint `/api/setup/update-image-urls` para atualizar banco de dados
- Service worker desabilitado

**Arquivos Modificados:**
- `backend/src/index.ts` — express.static adicionado
- `backend/src/services/admin.service.ts` — Conversão de URLs
- `backend/src/routes/setup.routes.ts` — Endpoint update-image-urls
- `src/main.tsx` — Service worker desabilitado

### Problemas de Acesso Admin

**Problema:** Inconsistência de email admin entre arquivos (`admin@numarstore.com.br` vs `admin@numarstore.com`) causava falha ao criar/verificar admin.

**Solução:**
- Unificado para `admin@numarstore.com` em todos os arquivos
- Adicionado script `verify-admin.ts` para verificar configuração
- Adicionado logging detalhado em auth middleware e auth service
- Adicionado lógica de refresh automático de token no Admin.tsx

**Arquivos Modificados:**
- `backend/src/scripts/create-admin.ts` — Email unificado
- `backend/src/routes/setup.routes.ts` — Email unificado
- `backend/src/middleware/auth.ts` — Logging detalhado
- `backend/src/services/auth.service.ts` — Logging detalhado
- `backend/src/scripts/verify-admin.ts` — Novo script
- `src/pages/admin/Admin.tsx` — Lógica de refresh

### Problemas de Auth e Cache

**Problema:** Service worker cacheava requisições de auth, tokens obsoletos no cache, inconsistência de email admin.

**Solução:** (detalhado acima)

---

## SEÇÃO 19 — Decisões Arquiteturais

### Por que Dois Bancos de Dados?

**PostgreSQL (Backend/Render):**
- Dados principais do sistema
- Usuários, produtos, carrinho, pedidos locais
- Controle total sobre schema e migrations
- Performance para queries complexas

**Supabase PostgreSQL:**
- Pedidos criados via Edge Functions
- Integração com Mercado Pago (webhooks)
- Envio de emails automáticos
- Facilita integrações externas

**Decisão:** Separação de responsabilidades — backend para dados operacionais, Supabase para integrações externas.

### Por que WhatsApp como Método de Pagamento Principal?

**Razões:**
- Simplicidade de implementação
- Sem necessidade de gateway de pagamento inicial
- Confiança do cliente brasileiro no WhatsApp
- Permite atendimento personalizado
- Reduz custos de transação inicialmente

**Decisão:** MVP com WhatsApp, preparado para Mercado Pago/Stripe futuramente.

### Por que TailwindCSS v3 e não v4?

**Razões:**
- v4 ainda em beta quando projeto iniciou
- v3 estável e bem documentado
- Configuração tradicional mais previsível
- Ecosystem de plugins mais maduro

**Decisão:** Usar v3 estável, avaliar v4 quando for LTS.

### Por que Vercel + Render (Separados)?

**Vercel (Frontend):**
- Deploy automático com git push
- CDN global
- Preview deployments
- Otimizado para React/Vite

**Render (Backend):**
- Suporte a Node.js/Express
- PostgreSQL gerenciado
- Logs detalhados
- Webhooks suportados

**Decisão:** Melhor ferramenta para cada parte — Vercel para frontend estático, Render para backend dinâmico.

### Por que CartContext no localStorage (Não Sincronizado com Backend)?

**Razões:**
- Simplicidade para MVP
- Não requer autenticação para usar carrinho
- Performance (sem chamadas de API)
- Usuário pode continuar comprando mesmo se deslogar

**Decisão:** Carrinho local por enquanto, pode migrar para backend no futuro se necessário.

### Outras Decisões

**JWT com Access + Refresh Token:**
- Access token curto (7 dias) para segurança
- Refresh token longo (30 dias) para UX
- Auto-refresh transparente no frontend

**Raw SQL sem ORM:**
- Performance máxima
- Controle total sobre queries
- Sem overhead de abstração
- Projeto pequeno não justifica ORM

**Radix UI + shadcn/ui:**
- Componentes acessíveis e customizáveis
- Sem dependência de framework específico
- Copy-paste para controle total
- Design system consistente

---

## SEÇÃO 20 — Scripts de Manutenção Backend

### Scripts Disponíveis (22 arquivos em backend/src/scripts/)

| Script | Propósito | Quando Usar |
|--------|-----------|--------------|
| create-admin.ts | Criar usuário admin | Setup inicial ou reset |
| check-admin.ts | Verificar se admin existe | Debug de auth |
| verify-admin.ts | Verificar configuração completa (DB, JWT, admin) | Debug de auth |
| reset-admin-password.ts | Resetar senha do admin | Esqueceu senha admin |
| update-subcategories.ts | Atualizar subcategorias no banco | Migração de dados |
| check-all-schemas.ts | Verificar schemas do banco | Debug de banco |
| check-tables.ts | Verificar tabelas do banco | Debug de banco |
| check-image-names.ts | Verificar nomes de imagens | Debug de imagens |
| check-image-urls-by-color.ts | Verificar URLs por cor | Debug de imagens |
| check-product-images.ts | Verificar imagens de produtos | Debug de imagens |
| check-products-schema.ts | Verificar schema de produtos | Debug de banco |
| fix-product-color-images.ts | Corrigir imagens por cor | Correção de dados |
| fix-products-schema.ts | Corrigir schema de produtos | Correção de dados |
| map-image-names.ts | Mapear nomes de imagens | Correção de dados |
| migrate-categories.ts | Migrar categorias | Migração de dados |
| migrate-missing-tables.ts | Migrar tabelas faltantes | Migração de dados |
| migrate-postgres.ts | Migrar para PostgreSQL | Migração de dados |
| migrate-production.ts | Migrar produção | Migração de dados |
| migrate-subcategories.ts | Migrar subcategorias | Migração de dados |
| revert-image-urls.ts | Reverter URLs de imagens | Correção de dados |
| update-all-image-urls.ts | Atualizar todas as URLs | Correção de dados |
| update-image-urls-local.ts | Atualizar URLs locais | Correção de dados |

---

## SEÇÃO 21 — Como Executar Localmente

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git

### Variáveis de Ambiente Necessárias

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:3001/api
VITE_SITE_URL=http://localhost:8080
VITE_WHATSAPP_NUMBER=5521979674510
VITE_INSTAGRAM=https://instagram.com/use.numar
VITE_LOJA_NOME=Numar Store
VITE_DESCONTO_PIX=5
```

**Backend (.env):**
```env
DATABASE_URL=file:./numarstore.db
JWT_SECRET=sua-secret-aqui-troque-isso
JWT_REFRESH_SECRET=sua-refresh-secret-aqui-troque-isso
JWT_EXPIRES_IN=7d
BANDEIRA_API_URL=https://viacep.com.br/ws
SENDGRID_API_KEY=SG.sua-chave-aqui
SENDGRID_FROM_EMAIL=contato@numarstore.com.br
SENDGRID_FROM_NAME=Numar Store
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:3001
SETUP_SECRET=numar-setup-2026
```

### Comandos

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas configurações
npm run dev
```

**Frontend:**
```bash
npm install
cp .env.example .env.local
# Editar .env.local com suas configurações
npm run dev
```

### Seed do Banco de Dados

O backend executa automaticamente migrations e seed ao iniciar:
- Cria tabelas PostgreSQL
- Cria usuário admin padrão (email: numarstoreadm@gmail.com, senha: MINUCELLY@)
- Seed de produtos (se não existirem)

**Para criar admin manualmente:**
```bash
cd backend
npm run create-admin
```

---

## SEÇÃO 22 — Arquivos Críticos

| Caminho | Tamanho | O que Contém | Quando Modificar |
|---------|--------|--------------|------------------|
| src/App.tsx | 131 linhas | Rotas e providers do frontend | Adicionar nova rota/página |
| backend/src/index.ts | 107 linhas | Entry point, middleware, rotas | Adicionar nova rota/middleware |
| backend/src/services/admin.service.ts | 1802 linhas | Lógica admin principal | Adicionar nova funcionalidade admin |
| backend/src/db/schema-postgres.ts | 228 linhas | Schema do banco PostgreSQL | Adicionar nova tabela/campo |
| src/pages/Checkout.tsx | 652 linhas | Fluxo de checkout | Modificar fluxo de pagamento |
| src/context/CartContext.tsx | 136 linhas | Carrinho (localStorage) | Modificar lógica do carrinho |
| src/api/client.ts | 113 linhas | Cliente API com auto-refresh | Adicionar novo endpoint |
| backend/src/utils/imageResolver.ts | 242 linhas | Sistema de imagens | Adicionar novo produto/imagens |
| backend/src/middleware/auth.ts | NÃO LIDO | JWT auth, admin check | Modificar lógica de auth |
| tailwind.config.ts | 99 linhas | Configuração TailwindCSS | Adicionar novo tema/cores |
| vite.config.ts | 39 linhas | Configuração Vite | Modificar build/alias |
| vercel.json | 39 linhas | Configuração Vercel | Modificar headers/rewrites |
| .env.example | 19 linhas | Exemplo env vars frontend | Adicionar nova env var |
| backend/.env.example | 13 linhas | Exemplo env vars backend | Adicionar nova env var |

---

## SEÇÃO 23 — Regras e Convenções

### Nomenclatura de Arquivos e Componentes

**Componentes React:**
- PascalCase: `ProductCard.tsx`, `Header.tsx`
- UI components: kebab-case: `button.tsx`, `input.tsx` (shadcn/ui)
- Páginas: PascalCase: `Catalog.tsx`, `Checkout.tsx`
- Contexts: PascalCase com Context: `CartContext.tsx`

**Backend:**
- Routes: kebab-case: `auth.routes.ts`, `products.routes.ts`
- Services: kebab-case: `auth.service.ts`, `admin.service.ts`
- Scripts: kebab-case: `create-admin.ts`, `verify-admin.ts`

### Como Adicionar uma Nova Página

**Checklist:**
1. Criar arquivo em `src/pages/` (PascalCase.tsx)
2. Adicionar lazy import em `src/App.tsx`
3. Adicionar rota em `<Routes>` em `src/App.tsx`
4. Criar componente com Layout wrapper
5. Adicionar SEO component
6. Testar navegação

### Como Adicionar um Novo Endpoint

**Checklist:**
1. Criar função em service apropriado
2. Adicionar rota em routes apropriado (ex: admin.routes.ts)
3. Adicionar middleware se necessário (auth, admin)
4. Testar com curl/Postman
5. Adicionar tipo TypeScript se necessário
6. Atualizar api/client.ts se for endpoint público

### Onde Colocar Novos Componentes

**Componentes reutilizáveis:** `src/components/`
**Componentes específicos de página:** Mesmo arquivo da página
**UI components:** `src/components/ui/` (shadcn/ui)
**Hooks customizados:** `src/hooks/`
**Utilitários:** `src/utils/`

### Padrão de Tipos TypeScript

**Interfaces:** PascalCase
```typescript
interface Product {
  id: string;
  name: string;
  // ...
}
```

**Types:** PascalCase
```typescript
type CartItem = {
  id: number;
  productId: string;
  // ...
};
```

**Enums:** PascalCase
```typescript
type PaymentMethod = 'pix' | 'card';
```

### Como o Projeto Lida com Erros

**Frontend:**
- ErrorBoundary global em `src/App.tsx`
- Toast notifications (Sonner) para erros de usuário
- try/catch em async functions
- Validação de formulários com mensagens específicas

**Backend:**
- Error handler global em `backend/src/index.ts`
- Sentry integration para error tracking
- Logs detalhados em middleware e services
- Status codes HTTP apropriados (400, 401, 403, 404, 500)

---

## SEÇÃO 24 — Próximos Passos e Pendências

### Prioridade Alta (Necessário para Lançamento)

- **Configurar Mercado Pago com chaves reais**
  - Obter MP_ACCESS_TOKEN
  - Atualizar Supabase env vars
  - Testar fluxo completo de pagamento
  - Dependências: Chaves de acesso MP

- **Configurar SendGrid com chaves reais**
  - Obter SENDGRID_API_KEY
  - Atualizar backend env vars
  - Testar envio de emails
  - Dependências: Chaves de acesso SendGrid

- **Testar fluxo completo de checkout**
  - Do carrinho até confirmação WhatsApp
  - Verificar cálculo de frete
  - Verificar aplicação de cupons
  - Dependências: Nenhuma

### Prioridade Média (Melhoria Importante)

- **Migrar carrinho para backend**
  - Criar endpoints de carrinho no backend
  - Sincronizar localStorage com backend
  - Autenticar carrinho
  - Dependências: Nenhuma

- **Implementar rastreamento de pedidos**
  - Integrar com transportadoras
  - Atualizar status automaticamente
  - Notificar cliente por email
  - Dependências: API de transportadora

- **Adicionar testes automatizados**
  - Escrever testes para componentes principais
  - Escrever testes para API endpoints
  - Configurar CI/CD
  - Dependências: Nenhuma

### Prioridade Baixa (Nice to Have)

- **Implementar upload de imagens**
  - UI para upload no admin
  - Integrar com Supabase Storage
  - Otimizar imagens automaticamente
  - Dependências: Nenhuma

- **Adicionar chat ao vivo**
  - Integrar com WhatsApp Business API
  - Widget de chat no frontend
  - Histórico de conversas
  - Dependências: WhatsApp Business API

- **Otimizar SEO**
  - Adicionar sitemap.xml
  - Adicionar robots.txt
  - Melhorar meta tags
  - Dependências: Nenhuma

---

## SEÇÃO 25 — Registro de Auditoria

| Data | Sessão | O que foi feito | Arquivos Modificados | Status |
|------|--------|-----------------|----------------------|--------|
| 08/06/2026 | Auditoria inicial | Leitura completa do projeto para gerar CONTEXT.md | N/A (leitura apenas) | ✅ Concluído |
| | | | | |
| | | | | |

---

> Gerado em: 08/06/2026 19:41 por Cascade/Windsurf
