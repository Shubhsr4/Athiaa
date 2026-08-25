import useSWR from 'swr';
import { defaultFetcher } from './fetcher';
import { SuccessStory } from '@/types';

export function useSuccessStories() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/success-stories',
    defaultFetcher
  );

  return {
    stories: (data?.data as SuccessStory[]) || [],
    isLoading,
    error,
    mutate,
  };
}
