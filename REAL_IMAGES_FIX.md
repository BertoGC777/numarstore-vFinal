# Correções Aplicadas - Imagens Reais no Admin

## Problema

O usuário quer ver as imagens reais das roupas no painel de admin, não placeholders rosa.

## Solução Aplicada

### 1. Backend Serve Arquivos Estáticos ✅
**Arquivo:** `backend/src/index.ts`
- Adicionado `app.use(express.static("public"))`
- Backend agora serve arquivos da pasta `public`

### 2. Imagens Copiadas para Backend ✅
- Criado pasta `backend/public/images`
- Copiadas todas as imagens de `src/assets/products/` para `backend/public/images`
- 153 arquivos copiados

### 3. Admin Service Atualizado ✅
**Arquivo:** `backend/src/services/admin.service.ts`

**Função `getProducts`:**
- Converte URLs relativas `/images/...` para URLs absolutas do backend
- Usa `https://numarstore-backend.onrender.com/images/...`

**Função `getProductById`:**
- Converte URLs relativas para URLs absolutas do backend
- Mesma lógica de conversão

### 4. Endpoint para Atualizar Banco de Dados ✅
**Arquivo:** `backend/src/routes/setup.routes.ts`
- Adicionado endpoint `POST /api/setup/update-image-urls`
- Atualiza todas as URLs no banco de dados de relativas para absolutas

## Para Atualizar o Banco de Dados

Após o deploy, execute:

```bash
curl -X POST https://numarstore-backend.onrender.com/api/setup/update-image-urls
```

Ou acesse no navegador:
```
https://numarstore-backend.onrender.com/api/setup/update-image-urls
```

## Para Fazer o Deploy

```bash
git add .
git commit -m "Fix: Serve real images from backend instead of placeholders"
git push
```

### Forçar Deploy
- **Vercel:** Dashboard → Deployments → Redeploy
- **Render:** Dashboard → Manual Deploy → Deploy latest commit

## Após o Deploy

### 1. Atualizar URLs no Banco de Dados
Execute o endpoint `/api/setup/update-image-urls` para converter todas as URLs no banco de dados.

### 2. Verificar Painel Admin
- Acesse `/admin/produtos`
- Imagens devem aparecer como roupas reais
- Não deve mostrar placeholders rosa
- Não deve mostrar "Imagem não disponível"

### 3. Verificar Debug Endpoint
Acesse `/api/setup/debug-products` para verificar se as URLs estão corretas.

## Resumo

- ✅ Backend serve arquivos estáticos
- ✅ Imagens copiadas para backend/public/images
- ✅ Admin service converte URLs para backend
- ✅ Endpoint para atualizar banco de dados
- ⏳ Deploy: Precisa ser feito
- ⏳ Atualizar banco de dados: Após deploy
