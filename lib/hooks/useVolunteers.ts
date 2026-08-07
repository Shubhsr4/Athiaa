import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher } from './fetcher';
import { Volunteer } from '@/types';
import { CreateVolunteerInput, UpdateVolunteerInput } from '@/lib/validations/volunteer';

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

export function useVolunteers(filters?: { status?: string }) {
  const serializedFilters = serializeFilters(filters);

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/volunteers', serializedFilters],
    async ([url, query]) => defaultFetcher(`${url}${query}`)
  );

  return {
    volunteers: (data?.data as Volunteer[]) || [],
    isLoading,
    error,
    mutate,
  };
}

export function useMyVolunteerStatus() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/volunteers?own=true',
    defaultFetcher
  );

  return {
    volunteer: (data?.data as Volunteer) || null,
    isLoading,
    error,
    mutate,
  };
}

export function useVolunteerMutations() {
  const { trigger: triggerApply } = useSWRMutation('/api/volunteers', postFetcher);

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/volunteers',
    async (key, { arg }: { arg: { id: string; data: UpdateVolunteerInput } }) => {
      return patchFetcher(`${key}/${arg.id}`, { arg: arg.data });
    }
  );

  return {
    applyAsVolunteer: (data: CreateVolunteerInput) => triggerApply(data),
    updateVolunteer: (id: string, data: UpdateVolunteerInput) => triggerUpdate({ id, data }),
  };
}
