-- Puffi initial schema
-- Apply in the Supabase SQL editor or via: supabase db push
--
-- Manual products (loaded by the user when Open Beauty Facts has no match)
-- live in `products` with source = 'manual' and created_by set.
-- That is the `custom_products` enrichment path described in the product spec.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.plan_tier as enum ('free', 'premium');
create type public.app_locale as enum ('es', 'en');
create type public.product_source as enum ('openbeautyfacts', 'manual');
create type public.conflict_severity as enum (
  'avoid',
  'separate_am_pm',
  'alternate_days',
  'caution'
);
create type public.time_of_day as enum ('am', 'pm');
create type public.product_category as enum (
  'cleanser',
  'toner',
  'essence',
  'serum',
  'treatment',
  'moisturizer',
  'oil',
  'sunscreen',
  'mask',
  'exfoliant',
  'eye_cream',
  'other'
);
create type public.skin_goal as enum (
  'acne',
  'anti_aging',
  'dark_spots',
  'hydration',
  'sensitive'
);
create type public.skin_type as enum (
  'dry',
  'oily',
  'combination',
  'normal',
  'sensitive'
);

-- ---------------------------------------------------------------------------
-- users (1:1 with auth.users; plan/locale live here, not in Auth)
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan public.plan_tier not null default 'free',
  locale public.app_locale not null default 'es',
  skin_goal public.skin_goal,
  skin_type public.skin_type,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products (catalog + user-submitted manuals)
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  name text not null,
  brand text,
  category public.product_category not null default 'other',
  source public.product_source not null,
  created_by uuid references public.users (id) on delete set null,
  image_url text,
  created_at timestamptz not null default now(),
  constraint products_manual_has_creator check (
    source <> 'manual' or created_by is not null
  )
);

create unique index products_barcode_unique
  on public.products (barcode)
  where barcode is not null;

create index products_name_idx on public.products (lower(name));
create index products_brand_idx on public.products (lower(brand));

-- ---------------------------------------------------------------------------
-- product_active_ingredients
-- ---------------------------------------------------------------------------

create table public.product_active_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  ingredient_key text not null,
  constraint product_active_ingredients_unique unique (product_id, ingredient_key),
  constraint ingredient_key_format check (ingredient_key ~ '^[a-z][a-z0-9_]*$')
);

create index product_active_ingredients_key_idx
  on public.product_active_ingredients (ingredient_key);

-- ---------------------------------------------------------------------------
-- ingredient_conflicts
-- Pairs are stored with ingredient_a < ingredient_b so lookup is order-independent.
-- ---------------------------------------------------------------------------

create table public.ingredient_conflicts (
  id uuid primary key default gen_random_uuid(),
  ingredient_a text not null,
  ingredient_b text not null,
  severity public.conflict_severity not null,
  explanation_es text not null,
  explanation_en text not null,
  constraint ingredient_conflicts_ordered check (ingredient_a < ingredient_b),
  constraint ingredient_conflicts_pair unique (ingredient_a, ingredient_b)
);

-- ---------------------------------------------------------------------------
-- user_products
-- ---------------------------------------------------------------------------

create table public.user_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  added_at timestamptz not null default now(),
  constraint user_products_unique unique (user_id, product_id)
);

create index user_products_user_idx on public.user_products (user_id);

-- ---------------------------------------------------------------------------
-- routine_sets (premium: house vs travel; free: a single active set)
-- ---------------------------------------------------------------------------

create table public.routine_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null default 'default',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index routine_sets_one_active_per_user
  on public.routine_sets (user_id)
  where is_active;

create index routine_sets_user_idx on public.routine_sets (user_id);

-- ---------------------------------------------------------------------------
-- routines (one row per step)
-- ---------------------------------------------------------------------------

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  routine_set_id uuid not null references public.routine_sets (id) on delete cascade,
  time_of_day public.time_of_day not null,
  step_order int not null,
  product_id uuid not null references public.products (id) on delete cascade,
  constraint routines_step_unique unique (routine_set_id, time_of_day, step_order)
);

create index routines_user_idx on public.routines (user_id);

-- ---------------------------------------------------------------------------
-- routine_logs (daily checklist)
-- ---------------------------------------------------------------------------

create table public.routine_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null default (timezone('utc', now()))::date,
  product_id uuid not null references public.products (id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  constraint routine_logs_unique unique (user_id, date, product_id)
);

create index routine_logs_user_date_idx on public.routine_logs (user_id, date);

-- ---------------------------------------------------------------------------
-- Auth trigger: create public.users on signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Plan is owned by billing (Lemon Squeezy webhooks), not by the client.
create or replace function public.protect_users_plan()
returns trigger
language plpgsql
as $$
begin
  if new.plan is distinct from old.plan
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'plan can only be updated by billing webhooks';
  end if;
  return new;
end;
$$;

create trigger protect_users_plan
  before update on public.users
  for each row execute function public.protect_users_plan();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_active_ingredients enable row level security;
alter table public.ingredient_conflicts enable row level security;
alter table public.user_products enable row level security;
alter table public.routine_sets enable row level security;
alter table public.routines enable row level security;
alter table public.routine_logs enable row level security;

create policy "users_select_own"
  on public.users for select
  using (id = auth.uid());

create policy "users_update_own"
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "products_select_all"
  on public.products for select
  using (true);

create policy "products_insert_manual_own"
  on public.products for insert
  to authenticated
  with check (
    source = 'manual'
    and created_by = auth.uid()
  );

create policy "products_update_own_manual"
  on public.products for update
  to authenticated
  using (created_by = auth.uid() and source = 'manual')
  with check (created_by = auth.uid() and source = 'manual');

create policy "ingredients_select_all"
  on public.product_active_ingredients for select
  using (true);

create policy "ingredients_insert_on_own_manual_product"
  on public.product_active_ingredients for insert
  to authenticated
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and p.created_by = auth.uid()
        and p.source = 'manual'
    )
  );

create policy "conflicts_select_all"
  on public.ingredient_conflicts for select
  using (true);

create policy "user_products_own_all"
  on public.user_products for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "routine_sets_own_all"
  on public.routine_sets for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "routines_own_all"
  on public.routines for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "routine_logs_own_all"
  on public.routine_logs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Seed: ingredient conflicts
-- Keys: retinol, vitamin_c, niacinamide, aha, bha, benzoyl_peroxide, spf
-- ---------------------------------------------------------------------------

insert into public.ingredient_conflicts (
  ingredient_a,
  ingredient_b,
  severity,
  explanation_es,
  explanation_en
) values
  (
    'retinol',
    'vitamin_c',
    'caution',
    'Retinol y vitamina C juntos pueden irritar. Lo más cómodo es separar: vitamina C por la mañana y retinol por la noche.',
    'Retinol and vitamin C together can irritate. A comfortable split is vitamin C in the morning and retinol at night.'
  ),
  (
    'aha',
    'retinol',
    'alternate_days',
    'Retinol y AHA exfolian y sensibilizan. Alterna días en lugar de usarlos la misma noche.',
    'Retinol and AHAs both increase sensitivity. Alternate days instead of using them the same night.'
  ),
  (
    'bha',
    'retinol',
    'alternate_days',
    'Retinol y BHA juntos suelen irritar. Alterna días o deja el BHA para la mañana si tu piel lo tolera.',
    'Retinol and BHAs together often irritate. Alternate days, or keep BHA for the morning if your skin tolerates it.'
  ),
  (
    'benzoyl_peroxide',
    'retinol',
    'avoid',
    'El peróxido de benzoilo puede oxidar e inactivar el retinol. No los combines en la misma rutina; usa uno u otro, o en días distintos.',
    'Benzoyl peroxide can oxidize and inactivate retinol. Do not combine them in the same routine; use one or the other, or on different days.'
  ),
  (
    'niacinamide',
    'vitamin_c',
    'caution',
    'El conflicto entre vitamina C y niacinamida es en gran parte un mito en fórmulas modernas: suele ser seguro. Si tienes piel muy sensible, introdúcelos de a uno.',
    'The vitamin C + niacinamide clash is largely a myth in modern formulas and is usually safe. If your skin is very sensitive, introduce them one at a time.'
  ),
  (
    'aha',
    'benzoyl_peroxide',
    'caution',
    'AHA y peróxido de benzoilo juntos pueden resecar e irritar. Si los usas, hidrata bien y no los apliques a la vez si tu piel arde.',
    'AHAs plus benzoyl peroxide can dry and irritate. If you use both, moisturize well and avoid stacking them if your skin stings.'
  ),
  (
    'benzoyl_peroxide',
    'bha',
    'caution',
    'BHA y peróxido de benzoilo juntos aumentan el riesgo de irritación. Empieza en días alternos si tu piel es reactiva.',
    'BHAs plus benzoyl peroxide raise irritation risk. Start on alternate days if your skin is reactive.'
  ),
  (
    'aha',
    'bha',
    'avoid',
    'Varios exfoliantes el mismo día (AHA + BHA) suelen ser demasiado. Elige uno por rutina o alterna días.',
    'Multiple exfoliants on the same day (AHA + BHA) is usually too much. Pick one per routine or alternate days.'
  );

-- ---------------------------------------------------------------------------
-- Grants (required when applying SQL as postgres)
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, update on table public.users to authenticated;

grant select on table public.products to anon, authenticated;
grant insert, update on table public.products to authenticated;

grant select on table public.product_active_ingredients to anon, authenticated;
grant insert on table public.product_active_ingredients to authenticated;

grant select on table public.ingredient_conflicts to anon, authenticated;

grant select, insert, update, delete on table public.user_products to authenticated;
grant select, insert, update, delete on table public.routine_sets to authenticated;
grant select, insert, update, delete on table public.routines to authenticated;
grant select, insert, update, delete on table public.routine_logs to authenticated;
