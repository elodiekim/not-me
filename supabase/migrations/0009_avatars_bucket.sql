-- First use of Supabase Storage in this project: a public "avatars" bucket
-- for profile photos. Files are stored under {user_id}/avatar.jpg so the RLS
-- policies below can pin write access to the owner via the folder name.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read: the bucket is public and profiles.avatar_url stores the public URL.
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Write access is limited to the owner: the first path segment must be the
-- caller's own uid, so a user can only touch files under their own folder.
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
