import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher, deleteFetcher } from './fetcher';
import { Dog, DogMedia } from '@/types';
import { CreateDogInput, UpdateDogInput } from '@/lib/validations/dog';

export interface DogWithMedia extends Dog {
  media?: DogMedia[];
}

export function useDog(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/dogs/${id}` : null,
    defaultFetcher
  );

  return {
    dog: (data?.data as DogWithMedia) || null,
    isLoading,
    error,
    mutate,
  };
}

export function useDogMutations() {
  const { trigger: triggerCreate } = useSWRMutation('/api/dogs', postFetcher);

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/dogs',
    async (key, { arg }: { arg: { id: string; data: UpdateDogInput } }) => {
      return patchFetcher(`${key}/${arg.id}`, { arg: arg.data });
    }
  );

  const { trigger: triggerDelete } = useSWRMutation(
    '/api/dogs',
    async (key, { arg }: { arg: string }) => {
      return deleteFetcher(`${key}/${arg}`);
    }
  );

  return {
    createDog: (data: CreateDogInput) => triggerCreate(data),
    updateDog: (id: string, data: UpdateDogInput) => triggerUpdate({ id, data }),
    deleteDog: (id: string) => triggerDelete(id),
  };
}
