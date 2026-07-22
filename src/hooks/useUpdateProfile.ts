import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

interface UpdateProfileInput {
  name: string;
  phone: string | null;
  // Local file URI from the image picker when the user chose a new photo,
  // or null to leave the existing avatar untouched.
  avatarUri: string | null;
}

// Fixed path per user so each new upload overwrites the last (upsert) instead
// of piling up files. The folder segment is the uid, which the storage RLS
// policies check to keep writes owner-only.
function avatarPath(userId: string) {
  return `${userId}/avatar.jpg`;
}

export function useUpdateProfile() {
  const userId = useAuthStore((state) => state.session?.user.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, phone, avatarUri }: UpdateProfileInput) => {
      if (!userId) throw new Error('Not signed in.');

      const fields: { name: string; phone: string | null; avatar_url?: string } = {
        name,
        phone,
      };

      if (avatarUri) {
        // fetch(uri).arrayBuffer() is the Supabase-recommended way to read a
        // local Expo asset for upload — no extra file-system dependency needed.
        const arrayBuffer = await fetch(avatarUri).then((res) => res.arrayBuffer());
        const path = avatarPath(userId);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(path);

        // The path is constant across uploads, so the public URL never changes —
        // bust the image cache with a timestamp so the new photo shows immediately.
        fields.avatar_url = `${publicUrl}?t=${Date.now()}`;
      }

      const { error: updateError } = await supabase.from('profiles').update(fields).eq('id', userId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
