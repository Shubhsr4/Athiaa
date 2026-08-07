import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher, deleteFetcher } from './fetcher';
import { BlogPost, PaginationMeta } from '@/types';
import { CreateBlogInput, UpdateBlogInput } from '@/lib/validations/blog';

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

export function useBlogPosts(filters?: {
  tags?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const serializedFilters = serializeFilters(filters);

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/blog', serializedFilters],
    async ([url, query]) => defaultFetcher(`${url}${query}`)
  );

  return {
    posts: (data?.data as BlogPost[]) || [],
    meta: (data?.meta as PaginationMeta) || { total: 0, page: 1, per_page: 20, total_pages: 1 },
    isLoading,
    error,
    mutate,
  };
}

export function useBlogPost(slug: string | null) {
  const { data, error, isLoading } = useSWR(
    slug ? `/api/blog/${slug}` : null,
    defaultFetcher
  );

  return {
    post: (data?.data as BlogPost) || null,
    isLoading,
    error,
  };
}

export function useBlogMutations() {
  const { trigger: triggerCreate } = useSWRMutation('/api/blog', postFetcher);

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/blog',
    async (key, { arg }: { arg: { id: string; data: UpdateBlogInput } }) => {
      return patchFetcher(`${key}/${arg.id}`, { arg: arg.data });
    }
  );

  const { trigger: triggerDelete } = useSWRMutation(
    '/api/blog',
    async (key, { arg }: { arg: string }) => {
      return deleteFetcher(`${key}/${arg}`);
    }
  );

  return {
    createPost: (data: CreateBlogInput) => triggerCreate(data),
    updatePost: (id: string, data: UpdateBlogInput) => triggerUpdate({ id, data }),
    deletePost: (id: string) => triggerDelete(id),
  };
}
