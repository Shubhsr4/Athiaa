import useSWR from 'swr';
import { defaultFetcher } from './fetcher';
import { Dog, PaginationMeta } from '@/types';

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

export function useDogs(filters?: {
  status?: string;
  breed?: string;
  size?: string;
  gender?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const serializedFilters = serializeFilters(filters);
  
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/dogs', serializedFilters],
    async ([url, query]) => {
      const res = await defaultFetcher(`${url}${query}`);
      return res;
    }
  );

  return {
    dogs: (data?.data as Dog[]) || [],
    meta: (data?.meta as PaginationMeta) || { total: 0, page: 1, per_page: 20, total_pages: 1 },
    isLoading,
    error,
    mutate,
  };
}
