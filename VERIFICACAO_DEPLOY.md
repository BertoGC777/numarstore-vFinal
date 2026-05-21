# Verificação de Deploy - Problemas de Imagens e Cache

## Problema Reportado

Após fazer push e atualizar deploys, aparentemente não mudou nada:
- Imagens de produtos não aparecem
- Ainda precisa limpar cache do site

## Correções Aplicadas

### 1. Simplificação da Query de Produtos ✅

**Arquivo:** `backend/src/services/product.service.ts`

**Problema:** A query com `json_agg` e `GROUP BY` estava causando problemas.

**Correção:** Simplificado para usar queries separadas:
- Primeiro busca todos os produtos
- Depois busca imagens para cada produto separadamente
- Mais simples e menos propenso a erros

```typescript
const products = await dbAll(query, params);

const productsWithImages = await Promise.all(
  products.map(async (p: any) => {
    const images = await dbAll(
      "SELECT url FROM product_images WHERE product_id = $1 ORDER BY sort_order",
      [p.id]
    );
    return {
      ...p,
      images: images.map((i: any) => i.url)
    };
  })
);
```

### 2. Cache Control Headers ✅

**Arquivo:** `vercel.json`

**Verificado:** Headers de cache control estão configurados:
- `/index.html`: `no-cache, no-store, must-revalidate`
- `/sw.js`: `no-cache, no-store, must-revalidate`
- `/assets/(.*)`: `public, max-age=31536000, immutable`
- `/(.*)`: `no-cache, no-store, must-revalidate`

### 3. Debug Endpoint ✅

**Arquivo:** `backend/src/routes/setup.routes.ts`

**Adicionado:** Endpoint `/api/setup/debug-products` para verificar imagens

## Como Verificar

### 1. Verificar se Imagens Estão no Banco de Dados

Acesse:
```
https://numarstore-backend.onrender.com/api/setup/debug-products
```

Deve retornar algo como:
```json
{
  "product": {
    "id": "...",
    "name": "...",
    "slug": "..."
  },
  "imagesCount": 3,
  "images": [
    { "url": "/images/...", "color": "...", "sort_order": 0 },
    ...
  ],
  "message": "Images found"
}
```

Se `imagesCount` for 0, o problema é que não há imagens no banco de dados.

### 2. Verificar se Produtos Retornam Imagens

Acesse:
```
https://numarstore-backend.onrender.com/api/products
```

Verifique se cada produto tem um campo `images` com URLs.

### 3. Verificar Cache Control

Abra DevTools (F12) → Network → Recarregue a página → Verifique headers de `index.html`:
- Deve ter `Cache-Control: no-cache, no-store, must-revalidate`

### 4. Limpar Cache do Navegador

Para garantir que não é cache do navegador:
1. DevTools (F12) → Application → Storage → Clear site data
2. Ou use modo incógnito

## Possíveis Causas

### Causa 1: Imagens Não Estão no Banco de Dados
Se o endpoint `/api/setup/debug-products` retorna `imagesCount: 0`, as imagens não foram inseridas no banco.

**Solução:** Verificar o seed de produtos e garantir que as imagens estão sendo inseridas.

### Causa 2: URLs das Imagens Estão Incorretas
Se as URLs começam com `/images/` mas não existe uma pasta pública ou endpoint para servir essas imagens.

**Solução:** Verificar se as imagens estão em uma pasta pública acessível ou se há um endpoint para servir imagens.

### Causa 3: Cache do Vercel/Render
Mesmo com headers de cache control, pode haver cache nos CDNs.

**Solução:** Forçar rebuild nos serviços.

### Causa 4: Service Worker Ainda Ativo
Mesmo desabilitado no código, o service worker pode ainda estar registrado no navegador.

**Solução:** Desabilitar service worker manualmente no navegador.

## Para Fazer o Deploy

```bash
git add .
git commit -m "Fix: Simplify product images query and add debug endpoint"
git push
```

### Forçar Deploy no Vercel
1. Dashboard do Vercel → Deployments
2. Clique nos três pontos (...) no deployment mais recente
3. Clique em "Redeploy"

### Forçar Deploy no Render
1. Dashboard do Render → Serviço numarstore-backend
2. Clique em "Manual Deploy"
3. Clique em "Deploy latest commit"

## Após o Deploy

1. **Testar Debug Endpoint:**
   ```
   https://numarstore-backend.onrender.com/api/setup/debug-products
   ```

2. **Testar API de Produtos:**
   ```
   https://numarstore-backend.onrender.com/api/products
   ```

3. **Verificar Logs do Render:**
   - Procurar por erros nas queries
   - Verificar se as queries estão sendo executadas

4. **Limpar Cache do Navegador:**
   - DevTools → Application → Clear site data
   - Ou usar modo incógnito

5. **Testar no Frontend:**
   - Acessar a página de produtos
   - Verificar se as imagens aparecem

## Se Ainda Não Funcionar

Compartilhe:
1. Resultado do endpoint `/api/setup/debug-products`
2. Resultado do endpoint `/api/products`
3. Logs do Render (especialmente erros de query)
4. Headers de resposta do `index.html` (DevTools → Network)
