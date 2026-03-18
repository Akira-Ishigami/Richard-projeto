# 🚀 Meu Projeto — Guia de Configuração

Stack: **Next.js 15 · Supabase · Tailwind CSS v4 · TypeScript**

---

## 📁 Estrutura do projeto

```
/app
  /login              → Tela de login e cadastro
  /dashboard          → Dashboard principal (protegido)
  /dashboard/items    → CRUD de itens (protegido)
  /profile            → Perfil do usuário (protegido)
  /admin              → Painel admin (admin only)
  /api/auth/callback  → Callback OAuth

/components
  /layout/Sidebar.tsx → Sidebar de navegação

/lib/supabase
  client.ts           → Cliente para o browser
  server.ts           → Cliente para Server Components

/types/index.ts       → Tipos TypeScript
middleware.ts         → Proteção de rotas
supabase-schema.sql   → SQL para rodar no Supabase
```

---

## ⚙️ Passo a passo

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
2. Vá em **Settings → API**
3. Copie a **Project URL** e a **anon public key**
4. Abra o arquivo `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_ANON_KEY_AQUI
```

### 3. Criar as tabelas no banco

1. No painel do Supabase, vá em **SQL Editor → New query**
2. Cole todo o conteúdo do arquivo `supabase-schema.sql`
3. Clique em **Run** (▶)

Isso vai criar:
- Tabela `profiles` com trigger automático
- Tabela `items` para o CRUD
- Row Level Security configurado
- Políticas de acesso por role

### 4. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Como virar admin

Após criar sua conta, rode no **SQL Editor** do Supabase:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

Depois faça logout e login novamente.

---

## 🗺️ Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/login` | Público | Login e cadastro |
| `/dashboard` | Logado | Dashboard com resumo |
| `/dashboard/items` | Logado | CRUD de itens |
| `/profile` | Logado | Editar perfil |
| `/admin` | Admin only | Painel de usuários |

---

## 🛠️ Comandos úteis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Rodar build
npm run lint     # Verificar erros
```
