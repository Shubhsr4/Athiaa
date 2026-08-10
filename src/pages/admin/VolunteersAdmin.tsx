import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Database } from '@/src/types/database.types';

type VolunteerStatus = Database['public']['Tables']['volunteers']['Row']['status'];

export default function VolunteersAdmin() {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch Volunteers Applications
  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as VolunteerStatus);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setVolunteers(data || []);
    } catch (err: any) {
      console.error('Fetch volunteers error:', err);
      setError(err.message || 'Failed to query volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter]);

  // Action: Approve or Reject Volunteer Application
  const handleUpdateStatus = async (vol: any, newStatus: VolunteerStatus) => {
    try {
      const { error: updateErr } = await supabase
        .from('volunteers')
        .update({ status: newStatus, reviewed_by: user?.id || null })
        .eq('id', vol.id);

      if (updateErr) throw updateErr;

      // On approval, update user_roles if linked user_id exists on row
      if (newStatus === 'approved' && vol.user_id) {
        await supabase
          .from('user_roles')
          .upsert({ user_id: vol.user_id, role: 'volunteer' }, { onConflict: 'user_id' });
      }

      // Audit Log insertion
      if (user?.id) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          action: newStatus === 'approved' ? 'APPROVE_VOLUNTEER' : 'REJECT_VOLUNTEER',
          table_name: 'volunteers',
          record_id: vol.id,
          details: { applicant_name: vol.full_name, status: newStatus }
        });
      }

      // Update local state
      setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, status: newStatus } : v));
    } catch (err: any) {
      alert(`Operation failed: ${err.message}`);
    }
  };

  // Filtered by Search
  const filteredVolunteers = volunteers.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (v.full_name || '').toLowerCase();
    const phone = (v.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Volunteer Applications</h1>
          <p className="text-xs text-gray-500 font-medium">Review citizen application dossiers, approve field partners, and assign regional rescue roles.</p>
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
            placeholder="Search by full name or phone..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
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
          <p className="text-xs font-bold text-gray-400">Loading volunteer applications...</p>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-orange-100 text-center space-y-2">
          <Users size={40} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-slate-700 font-baloo">No Volunteer Applications Found</p>
          <p className="text-xs text-gray-400">No applications match the selected query criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-100 font-mono text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="py-3.5 px-6">Applicant Name</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Skills / Availability</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVolunteers.map((vol) => (
                  <tr key={vol.id} className="hover:bg-slate-50/50 transition">
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm font-baloo">{vol.full_name || 'Athiaa Member'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Registered Citizen</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-mono text-[11px]">
                      {vol.phone}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {Array.isArray(vol.skills) ? vol.skills.join(', ') : vol.availability || 'Rescue Patrol & Feeder'}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono
                        ${vol.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${vol.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        ${vol.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                      `}>
                        {vol.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      {vol.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(vol, 'approved')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      )}
                      
                      {vol.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(vol, 'rejected')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredVolunteers.map((vol) => (
              <div key={vol.id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 font-baloo">{vol.full_name || 'Athiaa Member'}</h4>
                    <p className="text-xs text-gray-500 font-medium">{vol.phone}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono`}>
                    {vol.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(vol, 'approved')}
                    className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-emerald-200"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(vol, 'rejected')}
                    className="flex-1 bg-rose-50 text-rose-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 border border-rose-200"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TODO: Link volunteer approval to external SMS / WhatsApp API notification dispatch */}

    </div>
  );
}
