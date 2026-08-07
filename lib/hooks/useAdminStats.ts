import { useEffect } from 'react';
import useSWR from 'swr';
import { defaultFetcher } from './fetcher';
import { createClient } from '@/lib/supabase/client';

export interface AdminStats {
  total_dogs: number;
  available_dogs: number;
  adopted_this_month: number;
  donations_this_month: number;
  donations_count_this_month: number;
  pending_applications: number;
  active_volunteers: number;
  upcoming_events: number;
  unread_messages: number;
  recent_donations: Array<{
    id: string;
    donor_name: string;
    amount: number;
    currency: string;
    created_at: string;
  }>;
  recent_applications: Array<{
    id: string;
    dog_name: string;
    applicant_name: string;
    status: string;
    created_at: string;
  }>;
}

export function useAdminStats() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/stats',
    defaultFetcher,
    {
      refreshInterval: 30000,
    }
  );

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel('admin-stats')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => {
          mutate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'adoption_applications' },
        () => {
          mutate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  return {
    stats: (data?.data as AdminStats) || null,
    isLoading,
    error,
    mutate,
  };
}
