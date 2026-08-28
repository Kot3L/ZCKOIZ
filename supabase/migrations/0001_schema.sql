-- ZCKOiZ Zabrze - Initial schema migration
-- Tables: profiles, user_roles, news, programs, gallery_albums, gallery_images, documents, staff, site_settings

-- Helper function has_role (security definer)
create or replace function public.has_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role::text = required_role
  );
$$;

-- =====================================================================
-- PROFILES
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- USER ROLES
-- =====================================================================
create type public.app_role as enum ('admin', 'editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index user_roles_user_id_idx on public.user_roles (user_id);

-- =====================================================================
-- NEWS
-- =====================================================================
create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  excerpt text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('published', 'draft')),
  author_id uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_status_idx on public.news (status);
create index news_published_at_idx on public.news (published_at desc);

-- =====================================================================
-- PROGRAMS
-- =====================================================================
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  what_you_learn text,
  career_prospects text,
  school_type text not null check (school_type in ('technikum', 'branzowa')),
  icon_url text,
  cover_image_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- GALLERY
-- =====================================================================
create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
  image_url text not null,
  caption text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create index gallery_images_album_id_idx on public.gallery_images (album_id);

-- =====================================================================
-- DOCUMENTS
-- =====================================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_url text not null,
  category text not null default 'Inne',
  description text,
  file_size bigint,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- STAFF
-- =====================================================================
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text not null,
  department text,
  email text,
  phone text,
  photo_url text,
  display_order int not null default 0,
  is_management boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- SITE SETTINGS
-- =====================================================================
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz not null default now()
);
