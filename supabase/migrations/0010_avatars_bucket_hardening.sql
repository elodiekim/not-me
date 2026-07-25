-- Server-side hardening for the avatars bucket (0009): the client's
-- quality: 0.7 and contentType: 'image/jpeg' are hints only, and CLAUDE.md
-- says never to trust client-side validation. Enforce a size ceiling and an
-- image-only MIME allowlist at the bucket level so a crafted request can't
-- stash oversized or non-image files.
--
-- 5MB is comfortably above a square, quality-0.7 phone photo yet small enough
-- to keep abuse in check. The client always uploads image/jpeg, but png/webp
-- are allowed too so the bucket stays valid if the picker output ever changes.
update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'avatars';

-- The update policy from 0009 only had `using` (which existing rows may be
-- targeted), not `with check` (what the resulting row must satisfy) — so a
-- user could rename a row's path out of their own folder on update. Replace
-- it (0007's drop-and-recreate pattern) with both clauses pinned to the owner.
drop policy if exists "Users can update their own avatar" on storage.objects;

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
