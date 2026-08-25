import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  FileCheck2, 
  Search, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Database } from '@/src/types/database.types';

type AdoptionStatus = Database['public']['Tables']['adoption_requests']['Row']['status'];

export default function AdoptionsAdmin() {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch Adoption Requests
  const fetchAdoptions = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('adoption_requests')
        .select(`
          *,
          animal:animals (id, name, species, cover_image_url)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as AdoptionStatus);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setAdoptions(data || []);
    } catch (err: any) {
      console.error('Fetch adoptions error:', err);
      setError(err.message || 'Failed to query adoption requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, [statusFilter]);

  // Action: Approve / Reject / Complete
  const handleUpdateStatus = async (req: any, newStatus: AdoptionStatus) => {
    try {
      const { error: updateErr } = await supabase
        .from('adoption_requests')
        .update({ status: newStatus })
        .eq('id', req.id);

      if (updateErr) throw updateErr;

      // If approved, update animal status to 'adopted'
      if (newStatus === 'approved' && req.animal_id) {
        await supabase
          .from('animals')
          .update({ status: 'adopted' })
          .eq('id', req.animal_id);
      }

      // Audit Log insertion
      if (user?.id) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          action: `ADOPTION_${newStatus.toUpperCase()}`,
          table_name: 'adoption_requests',
          record_id: req.id,
          details: { applicant: req.full_name, animal_id: req.animal_id, status: newStatus }
        });
      }

      // Update local state
      setAdoptions(prev => prev.map(a => a.id === req.id ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  // Filtered by Search
  const filteredAdoptions = adoptions.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (a.full_name || '').toLowerCase();
    const phone = (a.phone || '').toLowerCase();
    const animalName = (a.animal?.name || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || animalName.includes(q);
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Adoption Requests</h1>
          <p className="text-xs text-gray-500 font-medium">Review home verification checks, interview adopters, and approve permanent rehoming.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by applicant name, phone, or pet name..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'approved', 'completed', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`
                px-3.5 py-2 rounded-2xl text-xs font-bold capitalize transition cursor-pointer shrink-0
                ${statusFilter === st 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* TABLE ON DESKTOP / CARDS ON MOBILE */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 size={32} className="animate-spin text-primary mx-auto" />
          <p className="text-xs font-bold text-gray-400">Loading adoption dossiers...</p>
        </div>
      ) : filteredAdoptions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-orange-100 text-center space-y-2">
          <FileCheck2 size={40} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-slate-700 font-baloo">No Adoption Requests Found</p>
          <p className="text-xs text-gray-400">No applications match your active status filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-100 font-mono text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="py-3.5 px-6">Requester</th>
                  <th className="py-3.5 px-4">Target Animal</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdoptions.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition">
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm font-baloo">{req.full_name || 'Adopter'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{req.phone || 'No phone'}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={req.animal?.cover_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'} 
                          alt={req.animal?.name || 'Animal'}
                          className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <span className="font-bold text-slate-800">{req.animal?.name || 'Rescue Stray'}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono
                        ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${req.status === 'completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                        ${req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        ${req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      `}>
                        {req.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(req.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleUpdateStatus(req, 'approved')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req, 'completed')}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-2.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req, 'rejected')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-2.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition"
                      >
                        Reject
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredAdoptions.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 font-baloo">{req.full_name || 'Adopter'}</h4>
                    <p className="text-xs text-gray-500 font-medium">Pet: {req.animal?.name || 'Rescue Pup'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono">
                    {req.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(req, 'approved')}
                    className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-emerald-200"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req, 'rejected')}
                    className="flex-1 bg-rose-50 text-rose-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-200"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
