-- =========================================================================
-- FESTA COM ALEGRIA - ESQUEMA SUPABASE & POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =========================================================================
-- Execute este script no SQL Editor do seu projeto Supabase para proteger todos
-- os dados e restringir o acesso exclusivamente aos usuários convidados/autorizados.

-- 1. Tabela de Perfis de Usuários Autorizados
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'decoradora', 'assistente')),
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativar RLS na tabela profiles
alter table public.profiles enable row level security;

-- Política de RLS: Apenas usuários autenticados podem ver seus perfis
create policy "Usuários autenticados podem ler seu próprio perfil"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Usuários autenticados podem atualizar seu próprio perfil"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- 2. Trigger automático para criar perfil quando usuário for convidado/criado no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Membro Ateliê'),
    'admin'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Associar trigger a auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Tabela de Pedidos (Orders) com RLS Estrito
create table if not exists public.orders (
  id text primary key,
  client_name text not null,
  client_phone text,
  party_date date not null,
  party_time text,
  theme text not null,
  location text not null,
  value numeric(10, 2) not null default 0,
  material_cost numeric(10, 2) not null default 0,
  status text not null default 'orcamento',
  payment_method text,
  installments integer,
  split_months jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) default auth.uid()
);

alter table public.orders enable row level security;

-- Políticas RLS para Pedidos: Apenas membros autenticados podem gerenciar
create policy "Acesso exclusivo a pedidos para usuários autenticados"
  on public.orders
  for all
  to authenticated
  using (true)
  with check (true);

-- 4. Tabela de Despesas (Expenses) com RLS Estrito
create table if not exists public.expenses (
  id text primary key,
  description text not null,
  amount numeric(10, 2) not null default 0,
  category text not null,
  date date not null,
  order_id text references public.orders(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) default auth.uid()
);

alter table public.expenses enable row level security;

create policy "Acesso exclusivo a despesas para usuários autenticados"
  on public.expenses
  for all
  to authenticated
  using (true)
  with check (true);

-- 5. Tabela de Catálogo (Catalog) com RLS Estrito
create table if not exists public.catalog (
  id text primary key,
  title text not null,
  category text not null,
  image_url text not null,
  estimated_price numeric(10, 2) not null default 0,
  description text,
  highlights jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) default auth.uid()
);

alter table public.catalog enable row level security;

create policy "Acesso exclusivo ao catálogo para usuários autenticados"
  on public.catalog
  for all
  to authenticated
  using (true)
  with check (true);

-- Bloqueio explícito de acesso público (anon):
-- Nenhuma tabela tem política para role 'anon', garantindo sigilo absoluto.
