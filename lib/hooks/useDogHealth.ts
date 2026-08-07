import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher } from './fetcher';

export function useDogHealth(dogId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    dogId ? `/api/dogs/${dogId}/health` : null,
    defaultFetcher
  );

  const { trigger: triggerAddRecord } = useSWRMutation(
    dogId ? `/api/dogs/${dogId}/health` : null,
    postFetcher
  );

  return {
    records: data?.data || [],
    isLoading,
    error,
    mutate,
    addHealthRecord: (recordData: any) => triggerAddRecord(recordData),
  };
}
