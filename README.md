# Studio Foto Charme — Plataforma de Gestão

Sistema de gestão financeira e de cobranças desenvolvido para o Studio Foto Charme. Permite acompanhar atendimentos, gerenciar clientes e disparar cobranças via WhatsApp de forma simples e eficiente.

**Stack:** Next.js 15 · Supabase · Tailwind CSS v4 · TypeScript

---

## Funcionalidades

- **Login seguro** com autenticação via Supabase
- **Dashboard** com resumo financeiro em tempo real
- **Gestões** — registro de atendimentos com navegação por mês
- **Cobranças** — controle de clientes com disparo de mensagens via webhook (n8n)
- **Proteção de rotas** via middleware com suporte a perfis admin

---

## Estrutura do projeto

```
app/
  login/                  → Tela de autenticação
  dashboard/              → Dashboard principal (protegido)
  dashboard/gestoes/      → Registro de atendimentos por cliente
  dashboard/cobrancas/    → Gestão e disparo de cobranças
  api/auth/callback/      → Callback OAuth

lib/supabase/
  client.ts               → Cliente Supabase (browser)
  server.ts               → Cliente Supabase (Server Components)

supabase/migrations/
  20250319000000_initial_schema.sql  → Schema completo do banco

middleware.ts             → Proteção de rotas autenticadas
```

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Variáveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

> Use a chave **anon** (não a service_role). Encontre em: Supabase → Settings → API.

### 3. Executar a migration no banco

1. Acesse o painel do Supabase → **SQL Editor → New query**
2. Cole o conteúdo de `supabase/migrations/20250319000000_initial_schema.sql`
3. Clique em **Run**

Isso cria:
- Tabela `profiles` — vinculada ao auth, com roles user/admin
- Tabela `gestoes` — atendimentos por cliente
- Tabela `clientes` — dados de cobrança mensal
- Row Level Security em todas as tabelas
- Triggers de `updated_at` automático
- Trigger de criação de perfil ao registrar usuário

### 4. Criar usuário

No painel do Supabase → **Authentication → Users → Add user → Create new user**.

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/login` | Público | Autenticação |
| `/dashboard` | Autenticado | Resumo financeiro |
| `/dashboard/gestoes` | Autenticado | Registro de atendimentos |
| `/dashboard/cobrancas` | Autenticado | Gestão de cobranças |
| `/admin` | Admin | Painel administrativo |

---

## Tornar usuário admin

Após o primeiro login, execute no **SQL Editor** do Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

---

## Comandos

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Iniciar build
npm run lint     # Verificar erros de lint
```
