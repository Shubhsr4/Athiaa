import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher } from './fetcher';
import { DonationCampaign } from '@/types';
import { CreateCampaignInput, UpdateCampaignInput } from '@/lib/validations/campaign';

const EMPTY_CAMPAIGNS: DonationCampaign[] = [];

export function useCampaigns(activeOnly = true) {
  const { data, error, isLoading, mutate } = useSWR(
    ['/api/campaigns', activeOnly],
    async ([url, active]) => {
      // Fetch /api/campaigns with parameter or directly
      const query = active ? '?active_only=true' : '?active_only=false';
      return defaultFetcher(`${url}${query}`);
    }
  );

  return {
    campaigns: (data?.data as DonationCampaign[]) || EMPTY_CAMPAIGNS,
    isLoading,
    error,
    mutate,
  };
}

export function useCampaignMutations() {
  const { trigger: triggerCreate } = useSWRMutation('/api/campaigns', postFetcher);

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/campaigns',
    async (key, { arg }: { arg: { id: string; data: UpdateCampaignInput } }) => {
      return patchFetcher(`${key}/${arg.id}`, { arg: arg.data });
    }
  );

  return {
    createCampaign: (data: CreateCampaignInput) => triggerCreate(data),
    updateCampaign: (id: string, data: UpdateCampaignInput) => triggerUpdate({ id, data }),
  };
}
