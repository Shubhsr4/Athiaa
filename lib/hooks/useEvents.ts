import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { defaultFetcher, postFetcher, patchFetcher } from './fetcher';
import { Event } from '@/types';
import { CreateEventInput, UpdateEventInput, EventRegistrationInput } from '@/lib/validations/event';

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

export function useEvents(filters?: { status?: string; upcoming?: boolean }) {
  const serializedFilters = serializeFilters(filters);

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/events', serializedFilters],
    async ([url, query]) => defaultFetcher(`${url}${query}`)
  );

  return {
    events: (data?.data as Event[]) || [],
    isLoading,
    error,
    mutate,
  };
}

export function useEventMutations() {
  const { trigger: triggerCreate } = useSWRMutation('/api/events', postFetcher);

  const { trigger: triggerUpdate } = useSWRMutation(
    '/api/events',
    async (key, { arg }: { arg: { id: string; data: UpdateEventInput } }) => {
      return patchFetcher(`${key}/${arg.id}`, { arg: arg.data });
    }
  );

  const { trigger: triggerRegister } = useSWRMutation(
    '/api/events',
    async (key, { arg }: { arg: { id: string; data: EventRegistrationInput } }) => {
      // POST /api/events/${id}/register
      return postFetcher(`${key}/${arg.id}/register`, { arg: arg.data });
    }
  );

  return {
    createEvent: (data: CreateEventInput) => triggerCreate(data),
    updateEvent: (id: string, data: UpdateEventInput) => triggerUpdate({ id, data }),
    registerForEvent: (id: string, data: EventRegistrationInput) => triggerRegister({ id, data }),
  };
}
