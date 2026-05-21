# Como Resolver o Erro de Acesso ao Painel Admin

## Problema
Você está sendo redirecionado para `/conta` ao tentar acessar o painel admin, com erro 401 "Token inválido".

## Causas Possíveis
1. Token expirado ou inválido
2. Usuário admin não existe no banco de produção
3. JWT_SECRET diferente entre frontend e backend
4. Refresh token também expirou

## Soluções

### Solução 1: Limpar localStorage e Fazer Login Novamente

1. Abra o DevTools (F12)
2. Vá para Application → Local Storage
3. Remova todos os itens:
   - `numar.token`
   - `numar.refreshToken`
   - `numar.user`
4. Recarregue a página
5. Faça login com: `admin@numarstore.com` / `admin123`

### Solução 2: Verificar/Criar Usuário Admin no Render

Se a Solução 1 não funcionar, o usuário admin pode não existir no banco de produção:

1. Acesse o painel do Render: https://dashboard.render.com
2. Vá para o serviço do backend (numarstore-backend)
3. Clique em "Shell" ou "SSH"
4. Execute o seguinte comando:
```bash
cd /opt/render/project/backend
npm run create-admin
```

Isso criará/atualizará o usuário admin com:
- Email: `admin@numarstore.com`
- Senha: `admin123`

### Solução 3: Usar Endpoint de Setup (Alternativa)

Se não tiver acesso ao Shell do Render, você pode usar o endpoint de setup:

1. Verificar se admin existe:
```bash
curl https://numarstore-backend.onrender.com/api/setup/check-admin
```

2. Criar admin (se necessário):
```bash
curl -X POST https://numarstore-backend.onrender.com/api/setup/create-admin \
  -H "Content-Type: application/json" \
  -H "x-setup-secret: numar-setup-2026"
```

### Solução 4: Verificar Variáveis de Ambiente

Certifique-se que estas variáveis estão configuradas no Render:
- `JWT_SECRET` - Deve ser a mesma em produção e desenvolvimento
- `DATABASE_URL` - URL do PostgreSQL de produção
- `FRONTEND_URL` - URL do frontend no Vercel

## Após Resolver

1. Limpe o localStorage novamente
2. Faça login com `admin@numarstore.com` / `admin123`
3. Tente acessar `/admin`

## Se Ainda Não Funcionar

Verifique os logs no painel do Render para identificar a causa específica do erro 401. Os logs mostrarão:
- Se o token está sendo recebido
- Se o usuário existe no banco
- Se o role do usuário é 'admin'
- Se há erro na verificação do JWT
