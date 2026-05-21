# Forçar Deploy e Verificar Problemas

## Problema: Mudanças não estão sendo aplicadas

Se as mudanças não estão sendo aplicadas ("como se nada tivesse sido alterado"), siga estes passos:

## Passo 1: Verificar se mudanças foram commitadas

```bash
git status
```

Se houver mudanças não commitadas:
```bash
git add .
git commit -m "Force deploy - JWT debug endpoints and cache fixes"
```

## Passo 2: Forçar deploy no Vercel

### Opção A: Via CLI
```bash
vercel --prod --force
```

### Opção B: Via Dashboard
1. Acesse https://vercel.com/dashboard
2. Vá para o projeto numarstore-v-final
3. Clique em "Deployments"
4. Clique nos três pontos (...) no deployment mais recente
5. Clique em "Redeploy"

## Passo 3: Forçar deploy no Render

### Opção A: Via CLI
```bash
cd backend
git push origin main
```

### Opção B: Via Dashboard
1. Acesse https://dashboard.render.com
2. Vá para o serviço numarstore-backend
3. Clique em "Manual Deploy"
4. Clique em "Deploy latest commit"

## Passo 4: Verificar Debug Endpoints

Após o deploy, acesse:

### Verificar configuração JWT:
```
https://numarstore-backend.onrender.com/api/setup/debug-jwt
```

Deve retornar algo como:
```json
{
  "jwtSecretConfigured": true,
  "jwtRefreshSecretConfigured": true,
  "tokenExpiration": "604800",
  "refreshExpiration": "2592000",
  "databaseUrlConfigured": true,
  "nodeEnv": "production"
}
```

### Verificar se admin existe:
```
https://numarstore-backend.onrender.com/api/setup/check-admin
```

### Testar geração de token:
```
https://numarstore-backend.onrender.com/api/setup/test-token
```

## Passo 5: Verificar Logs do Render

1. Acesse https://dashboard.render.com
2. Vá para o serviço numarstore-backend
3. Clique em "Logs"
4. Procure por: "=== JWT Configuration ==="
5. Verifique se mostra:
   - JWT_SECRET configured: true/false
   - JWT_SECRET length: [número]
   - TOKEN_EXPIRATION: 604800 seconds

## Passo 6: Limpar Cache do Navegador

1. DevTools (F12) → Application
2. Storage → Clear site data
3. Ou use modo incógnito

## Passo 7: Testar Login

1. Acesse /conta
2. Email: `admin@numarstore.com`
3. Senha: `admin123`
4. Verifique console para logs

## Se Ainda Não Funcionar

Compartilhe:
1. Resultado do endpoint `/api/setup/debug-jwt`
2. Logs do Render (especialmente "=== JWT Configuration ===")
3. Logs do console do navegador após tentar login
