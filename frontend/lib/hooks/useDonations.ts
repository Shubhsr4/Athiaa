import { useState } from 'react';
import useSWR from 'swr';
import { defaultFetcher } from './fetcher';
import { Donation, PaginationMeta } from '@/types';
import { CreateDonationInput } from '@/lib/validations/donation';
import { apiFetch } from '@/lib/api/clientApi';

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

export function useDonations(filters?: {
  status?: string;
  campaign_id?: string;
  page?: number;
  per_page?: number;
}) {
  const serializedFilters = serializeFilters(filters);

  const { data, error, isLoading, mutate } = useSWR(
    ['/api/donations', serializedFilters],
    async ([url, query]) => defaultFetcher(`${url}${query}`)
  );

  return {
    donations: (data?.data as Donation[]) || [],
    meta: (data?.meta as PaginationMeta) || { total: 0, page: 1, per_page: 20, total_pages: 1 },
    isLoading,
    error,
    mutate,
  };
}

export function useDonationFlow() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateDonation = async (data: CreateDonationInput) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await apiFetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Failed to initiate donation');
      }
      return json.data; // contains { donation_id }
    } catch (err: any) {
      const msg = err.message || 'Failed to initiate donation';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const startPayment = async (donationId: string, gateway: 'stripe' | 'razorpay' | 'paypal') => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await apiFetch('/api/donations/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ donation_id: donationId, gateway }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Failed to start payment gateway session');
      }
      return json.data; // contains gateway details
    } catch (err: any) {
      const msg = err.message || 'Payment initiation failed';
      setError(msg);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiateDonation,
    startPayment,
    isProcessing,
    error,
  };
}
