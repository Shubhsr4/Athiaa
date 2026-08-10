import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/src/utils/supabase';

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
  const [dogs, setDogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchDogs = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'available') {
          query = query.in('status', ['rescued', 'under_treatment', 'fostered']);
        } else {
          query = query.eq('status', filters.status as any);
        }
      } else {
        query = query.in('status', ['rescued', 'under_treatment', 'fostered']);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setDogs(data || []);
    } catch (err: any) {
      console.error('Error fetching animals for adoption:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [filters?.status]);

  useEffect(() => {
    let channel: any = null;

    fetchDogs();

    // Attach Realtime subscription for animals table
    channel = supabase
      .channel('public:animals_adopt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'animals' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAnimal = payload.new;
            if (['rescued', 'under_treatment', 'fostered'].includes(newAnimal.status)) {
              setDogs((prev) => [newAnimal, ...prev.filter((a) => a.id !== newAnimal.id)]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedAnimal = payload.new;
            if (!['rescued', 'under_treatment', 'fostered'].includes(updatedAnimal.status)) {
              // Automatically remove from public Adopt page when marked adopted or deceased
              setDogs((prev) => prev.filter((a) => a.id !== updatedAnimal.id));
            } else {
              setDogs((prev) =>
                prev.map((a) => (a.id === updatedAnimal.id ? updatedAnimal : a))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedAnimal = payload.old;
            setDogs((prev) => prev.filter((a) => a.id !== deletedAnimal.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchDogs]);

  return {
    dogs,
    isLoading,
    error,
    mutate: fetchDogs
  };
}
