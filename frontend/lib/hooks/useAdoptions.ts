import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher } from './fetcher';
import { AdoptionApplication, PaginationMeta } from '@/types';
import { CreateAdoptionInput, UpdateAdoptionInput } from '@/lib/validations/adoption';

function serializeFilters(filters?: Record<string, any>): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const str = params.toString();
  return str ? `?${str}` : '';
}

export function useAdoptions(filters?: {
  status?: string;
  page?: number;
  per_page?: number;
}) {
  const serializedFilters = serializeFilters(filters);

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/adoptions', serializedFilters],
    async ([url, query]) => {
      return defaultFetcher(`${url}${query}`);
    }
  );

  return {
    applications: (data?.data as AdoptionApplication[]) || [],
    meta: (data?.meta as PaginationMeta) || { total: 0, page: 1, per_page: 20, total_pages: 1 },
    isLoading,
    error,
    mutate,
  };
}

export function useAdoptionMutations() {
  const { trigger: triggerSubmit } = useSWRMutation('/api/adoptions', postFetcher);

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/adoptions',
    async (key, { arg }: { arg: { id: string; data: UpdateAdoptionInput } }) => {
      // PATCH /api/adoptions/${id}
      return patchFetcher(`${key}/${arg.id}`, { arg: arg.data });
    }
  );

  return {
    submitApplication: (data: CreateAdoptionInput) => triggerSubmit(data),
    updateApplication: (id: string, data: UpdateAdoptionInput) => triggerUpdate({ id, data }),
  };
}
