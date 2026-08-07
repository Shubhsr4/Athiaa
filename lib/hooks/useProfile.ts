import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher } from './fetcher';
import { useUser } from './useAuth';
import { Profile } from '@/types';
import { UpdateProfileInput } from '@/lib/validations/profile';

export function useProfile() {
  const user = useUser();

  const { data, error, isLoading, mutate } = useSWR(
    user ? '/api/profile' : null,
    defaultFetcher
  );

  return {
    profile: (data?.data as Profile) || null,
    isLoading,
    error,
    mutate,
  };
}

export function useProfileMutations() {
  const { mutate } = useSWRConfig();

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/profile',
    async (key, { arg }: { arg: UpdateProfileInput }) => {
      const res = await patchFetcher(key, { arg });
      // Revalidate cache
      mutate('/api/profile');
      return res;
    }
  );

  const { trigger: triggerAvatar } = useSWRMutation(
    '/api/profile/avatar',
    async (key, { arg }: { arg: { public_url: string; storage_path?: string } }) => {
      const res = await postFetcher(key, { arg });
      // Revalidate cache
      mutate('/api/profile');
      return res;
    }
  );

  return {
    updateProfile: (data: UpdateProfileInput) => triggerUpdate(data),
    updateAvatar: (data: { public_url: string; storage_path?: string }) => triggerAvatar(data),
  };
}
