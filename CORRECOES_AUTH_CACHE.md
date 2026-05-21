# Correções Realizadas - Problemas de Autenticação e Cache

## Problemas Identificados

1. **Service Worker Cacheando Requisições de API** - O service worker estava cacheando TODAS as requisições HTTP, incluindo chamadas de API (`/api/*`). Isso causava:
   - Respostas de login cacheadas
   - Tokens obsoletos no cache
   - Requisições de auth retornando respostas cacheadas inválidas
   - Necessidade de limpar cache manualmente toda vez

2. **Inconsistência de Email Admin** - O email do admin estava diferente em alguns arquivos:
   - `admin@numarstore.com.br` em alguns scripts
   - `admin@numarstore.com` em outros
   - Isso causava falha ao criar/verificar admin

3. **Falta de Logging** - Não havia logs detalhados para debug de autenticação

## Correções Implementadas

### 1. Service Worker (`public/sw.js`)
- Adicionado filtro para NÃO cachear requisições de API (`/api/`)
- Adicionado filtro para NÃO cachear requisições de auth (`/auth/`, `/login`, `/register`)
- Mantém cache apenas para páginas estáticas

### 2. Service Worker Desabilitado (`src/main.tsx`)
- Desabilitado temporariamente o registro do service worker
- Isso elimina completamente problemas de cache durante debug
- Pode ser reabilitado após confirmar que auth funciona

### 3. Inconsistência de Email Admin
- Unificado para `admin@numarstore.com` em todos os arquivos:
  - `backend/src/scripts/create-admin.ts`
  - `backend/src/routes/setup.routes.ts`
  - `backend/src/db/seed-postgres.ts`

### 4. Logging Detalhado
- Adicionado logs em `backend/src/middleware/auth.ts`:
  - Auth middleware: log de verificação de token
  - Admin middleware: log de verificação de admin
  - Refresh middleware: log de refresh de token
  - Warning quando usando JWT_SECRET default
- Adicionado logs em `backend/src/services/auth.service.ts`:
  - loginUser: log de tentativa de login
  - Log de usuário encontrado
  - Log de sucesso/falha

### 5. Script de Verificação (`backend/src/scripts/verify-admin.ts`)
- Novo script para verificar:
  - Se DATABASE_URL está configurado
  - Se JWT_SECRET está configurado
  - Se usuário admin existe no banco
  - Role do usuário admin

### 6. Componente Admin (`src/pages/admin/Admin.tsx`)
- Adicionada lógica de refresh automático de token
- Tenta refresh antes de redirecionar para /conta
- Limpa localStorage apenas se refresh falhar

## Instruções para Resolver

### Passo 1: Deploy das Mudanças
```bash
git add .
git commit -m "Fix auth and cache issues"
git push
```

### Passo 2: Limpar Service Worker no Navegador
Após o deploy, limpe o service worker antigo:
1. Abra DevTools (F12)
2. Vá para Application → Service Workers
3. Clique em "Unregister" para remover o service worker antigo
4. Recarregue a página

### Passo 3: Limpar localStorage
1. Abra DevTools (F12)
2. Vá para Application → Local Storage
3. Remova: `numar.token`, `numar.refreshToken`, `numar.user`
4. Recarregue a página

### Passo 4: Verificar Admin no Render
No painel do Render → Shell do backend:
```bash
cd /opt/render/project/backend
npm run verify-admin
```

Isso mostrará:
- Se DATABASE_URL está configurado
- Se JWT_SECRET está configurado
- Se usuário admin existe
- Role do usuário admin

### Passo 5: Criar Admin se Necessário
Se o verify-admin mostrar que não há admin:
```bash
npm run create-admin
```

### Passo 6: Configurar JWT_SECRET no Render
Se o verify-admin mostrar que JWT_SECRET não está configurado:
1. Acesse o painel do Render
2. Vá para o serviço do backend
3. Environment Variables
4. Adicione:
   - `JWT_SECRET` = uma string aleatória longa (ex: 64 caracteres)
   - `JWT_REFRESH_SECRET` = outra string aleatória longa
5. Redeploy o serviço

### Passo 7: Fazer Login
- Email: `admin@numarstore.com`
- Senha: `admin123`

### Passo 8: Verificar Logs
Se ainda houver problemas, verifique os logs no Render:
- Logs mostrarão tentativas de login
- Logs mostrarão se JWT_SECRET está configurado
- Logs mostrarão erros específicos

## Resumo das Mudanças nos Arquivos

1. `public/sw.js` - Filtros para não cachear API/auth
2. `src/main.tsx` - Service worker desabilitado
3. `src/pages/admin/Admin.tsx` - Lógica de refresh de token
4. `backend/src/scripts/create-admin.ts` - Email unificado
5. `backend/src/routes/setup.routes.ts` - Email unificado
6. `backend/src/middleware/auth.ts` - Logging detalhado + warnings
7. `backend/src/services/auth.service.ts` - Logging detalhado
8. `backend/src/scripts/verify-admin.ts` - Novo script de verificação
9. `backend/package.json` - Adicionado script verify-admin

## Próximos Passos Após Funcionar

1. Reabilitar service worker em `src/main.tsx` (descomentar linhas)
2. Testar que auth funciona com service worker ativo
3. Monitorar logs para garantir que não há erros
