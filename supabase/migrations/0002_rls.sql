-- ZCKOiZ Zabrze - Row Level Security policies

-- =====================================================================
-- ENABLE RLS
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.news enable row level security;
alter table public.programs enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.documents enable row level security;
alter table public.staff enable row level security;
alter table public.site_settings enable row level security;

-- =====================================================================
-- PROFILES
-- Public: none (profiles are user-specific)
-- Authenticated: read own profile, all admins read all
-- Admin/editor: manage all
-- =====================================================================
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.has_role('admin') or public.has_role('editor'));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.has_role('admin'))
  with check (id = auth.uid() or public.has_role('admin'));

drop policy if exists "profiles_insert_service" on public.profiles;
create policy "profiles_insert_service"
  on public.profiles for insert
  to service_role
  with check (true);

-- =====================================================================
-- USER ROLES
-- Select: admin only (to see who has what roles)
-- Insert/delete: admin only
-- =====================================================================
drop policy if exists "user_roles_select_admin" on public.user_roles;
create policy "user_roles_select_admin"
  on public.user_roles for select
  to authenticated
  using (public.has_role('admin') or user_id = auth.uid());

drop policy if exists "user_roles_insert_admin" on public.user_roles;
create policy "user_roles_insert_admin"
  on public.user_roles for insert
  to authenticated
  with check (public.has_role('admin'));

drop policy if exists "user_roles_delete_admin" on public.user_roles;
create policy "user_roles_delete_admin"
  on public.user_roles for delete
  to authenticated
  using (public.has_role('admin'));

-- =====================================================================
-- NEWS
-- Public read: only published
-- Admin/editor: full CRUD (read all incl. drafts)
-- =====================================================================
drop policy if exists "news_select_public_published" on public.news;
create policy "news_select_public_published"
  on public.news for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "news_select_staff" on public.news;
create policy "news_select_staff"
  on public.news for select
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "news_insert_staff" on public.news;
create policy "news_insert_staff"
  on public.news for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "news_update_staff" on public.news;
create policy "news_update_staff"
  on public.news for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "news_delete_staff" on public.news;
create policy "news_delete_staff"
  on public.news for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

-- =====================================================================
-- PROGRAMS (public: all active)
-- =====================================================================
drop policy if exists "programs_select_public" on public.programs;
create policy "programs_select_public"
  on public.programs for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "programs_select_staff" on public.programs;
create policy "programs_select_staff"
  on public.programs for select
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "programs_insert_staff" on public.programs;
create policy "programs_insert_staff"
  on public.programs for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "programs_update_staff" on public.programs;
create policy "programs_update_staff"
  on public.programs for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "programs_delete_staff" on public.programs;
create policy "programs_delete_staff"
  on public.programs for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

-- =====================================================================
-- GALLERY (public read all)
-- =====================================================================
drop policy if exists "gallery_select_public" on public.gallery_albums;
create policy "gallery_select_public"
  on public.gallery_albums for select
  to anon, authenticated
  using (true);

drop policy if exists "gallery_insert_staff" on public.gallery_albums;
create policy "gallery_insert_staff"
  on public.gallery_albums for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "gallery_update_staff" on public.gallery_albums;
create policy "gallery_update_staff"
  on public.gallery_albums for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "gallery_delete_staff" on public.gallery_albums;
create policy "gallery_delete_staff"
  on public.gallery_albums for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "gallery_images_select_public" on public.gallery_images;
create policy "gallery_images_select_public"
  on public.gallery_images for select
  to anon, authenticated
  using (true);

drop policy if exists "gallery_images_insert_staff" on public.gallery_images;
create policy "gallery_images_insert_staff"
  on public.gallery_images for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "gallery_images_update_staff" on public.gallery_images;
create policy "gallery_images_update_staff"
  on public.gallery_images for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "gallery_images_delete_staff" on public.gallery_images;
create policy "gallery_images_delete_staff"
  on public.gallery_images for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

-- =====================================================================
-- DOCUMENTS (public read all)
-- =====================================================================
drop policy if exists "documents_select_public" on public.documents;
create policy "documents_select_public"
  on public.documents for select
  to anon, authenticated
  using (true);

drop policy if exists "documents_insert_staff" on public.documents;
create policy "documents_insert_staff"
  on public.documents for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "documents_update_staff" on public.documents;
create policy "documents_update_staff"
  on public.documents for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "documents_delete_staff" on public.documents;
create policy "documents_delete_staff"
  on public.documents for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

-- =====================================================================
-- STAFF (public read all)
-- =====================================================================
drop policy if exists "staff_select_public" on public.staff;
create policy "staff_select_public"
  on public.staff for select
  to anon, authenticated
  using (true);

drop policy if exists "staff_insert_staff" on public.staff;
create policy "staff_insert_staff"
  on public.staff for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "staff_update_staff" on public.staff;
create policy "staff_update_staff"
  on public.staff for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "staff_delete_staff" on public.staff;
create policy "staff_delete_staff"
  on public.staff for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

-- =====================================================================
-- SITE SETTINGS (public read all, staff write)
-- =====================================================================
drop policy if exists "site_settings_select_public" on public.site_settings;
create policy "site_settings_select_public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_insert_staff" on public.site_settings;
create policy "site_settings_insert_staff"
  on public.site_settings for insert
  to authenticated
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "site_settings_update_staff" on public.site_settings;
create policy "site_settings_update_staff"
  on public.site_settings for update
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'))
  with check (public.has_role('admin') or public.has_role('editor'));

drop policy if exists "site_settings_delete_staff" on public.site_settings;
create policy "site_settings_delete_staff"
  on public.site_settings for delete
  to authenticated
  using (public.has_role('admin') or public.has_role('editor'));

-- =====================================================================
-- GRANTS
-- =====================================================================
grant usage on schema public to anon, authenticated, service_role;

grant select on public.profiles to authenticated;
grant update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

grant select, insert, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.user_roles to service_role;

grant select on public.news to anon;
grant select, insert, update, delete on public.news to authenticated;
grant select, insert, update, delete on public.news to service_role;

grant select on public.programs to anon;
grant select, insert, update, delete on public.programs to authenticated;
grant select, insert, update, delete on public.programs to service_role;

grant all on public.gallery_albums to anon, authenticated, service_role;
grant all on public.gallery_images to anon, authenticated, service_role;
grant all on public.documents to anon, authenticated, service_role;
grant all on public.staff to anon, authenticated, service_role;
grant all on public.site_settings to anon, authenticated, service_role;

-- Anonymous needs select on app_role type usage for has_role function calls
grant usage on type public.app_role to anon, authenticated, service_role;
