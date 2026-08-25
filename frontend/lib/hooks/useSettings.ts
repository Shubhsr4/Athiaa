import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, patchFetcher } from './fetcher';
import { SiteSettings } from '@/types';

export function useSettings() {
  const { data, error, isLoading } = useSWR(
    '/api/settings',
    defaultFetcher
  );

  return {
    settings: (data?.data as SiteSettings) || null,
    isLoading,
    error,
  };
}

export function useSettingsMutation() {
  const { mutate } = useSWRConfig();

  const { trigger } = useSWRMutation(
    '/api/settings',
    async (url, { arg }: { arg: { key: string; value: any } }) => {
      const res = await patchFetcher(url, { arg });
      mutate('/api/settings');
      return res;
    }
  );

  return {
    updateSetting: (key: string, value: any) => trigger({ key, value }),
  };
}
