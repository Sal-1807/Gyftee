import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAvatar, updateUsername } from '@/services/users.service';
import { useAuth } from '@/features/auth/AuthContext';

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, avatarFile }: { username?: string; avatarFile?: File }) => {
      if (!user) throw new Error('Not authenticated');
      if (avatarFile) await updateAvatar(user.id, avatarFile);
      if (username && username !== user.username) await updateUsername(user.id, username);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
