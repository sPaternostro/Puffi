# Puffi

Web app de rutinas de skincare: combina productos en el orden correcto y avisa si hay activos incompatibles.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + Storage)
- Deploy: Vercel

## Setup local

```bash
npm install
cp .env.example .env.local
```

Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.

```bash
npm run dev
```

## Schema (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. SQL Editor → pega y ejecuta `supabase/migrations/20260908120000_init.sql`.

Eso crea tablas, RLS, el trigger que copia `auth.users` → `public.users`, y el seed de `ingredient_conflicts`.
