-- ZCKOiZ Zabrze - Storage buckets and policies

-- Public bucket for media (images + documents)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Upload only for authenticated users with a role
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_staff_insert" on storage.objects;
create policy "media_staff_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (public.has_role('admin') or public.has_role('editor'))
  );

drop policy if exists "media_staff_update" on storage.objects;
create policy "media_staff_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (public.has_role('admin') or public.has_role('editor'))
  );

drop policy if exists "media_staff_delete" on storage.objects;
create policy "media_staff_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (public.has_role('admin') or public.has_role('editor'))
  );
