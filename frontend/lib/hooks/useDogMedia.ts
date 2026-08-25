import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, deleteFetcher } from './fetcher';
import { DogMedia } from '@/types';

export function useDogMedia(dogId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    dogId ? `/api/dogs/${dogId}/media` : null,
    defaultFetcher
  );

  return {
    media: (data?.data as DogMedia[]) || [],
    isLoading,
    error,
    mutate,
  };
}

export function useDogMediaMutations(dogId: string) {
  const { trigger: triggerAdd } = useSWRMutation(
    `/api/dogs/${dogId}/media`,
    postFetcher
  );

  const { trigger: triggerRemove } = useSWRMutation(
    `/api/dogs/${dogId}/media`,
    async (key, { arg }: { arg: string }) => {
      // DELETE request to /api/dogs/${dogId}/media/${mediaId}
      // Since key is /api/dogs/${dogId}/media, we append /${mediaId}
      return deleteFetcher(`${key}/${arg}`);
    }
  );

  return {
    addMedia: (data: { url: string; caption?: string; is_main?: boolean }) => triggerAdd(data),
    removeMedia: (mediaId: string) => triggerRemove(mediaId),
  };
}
