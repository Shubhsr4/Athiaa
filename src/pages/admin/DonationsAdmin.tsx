import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { 
  HeartHandshake, 
  Search, 
  TrendingUp, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import type { Database } from '@/src/types/database.types';

type DonationStatus = Database['public']['Tables']['donations']['Row']['status'];

export default function DonationsAdmin() {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Donations
  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as DonationStatus);
      }

      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', new Date(endDate + 'T23:59:59').toISOString());
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setDonations(data || []);
    } catch (err: any) {
      console.error('Fetch donations error:', err);
      setError(err.message || 'Failed to query donation database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, startDate, endDate]);

  // Filtered by Search
  const filteredDonations = donations.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.donor_name && d.donor_name.toLowerCase().includes(q)) ||
      (d.donor_email && d.donor_email.toLowerCase().includes(q)) ||
      (d.donor_phone && d.donor_phone.toLowerCase().includes(q)) ||
      (d.razorpay_payment_id && d.razorpay_payment_id.toLowerCase().includes(q))
    );
  });

  // Calculate Running Total
  const runningTotal = filteredDonations.reduce((acc, curr) => {
    if (curr.status === 'paid') {
      return acc + (Number(curr.amount) || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER & RUNNING TOTAL SUMMARY */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Donations Audit</h1>
          <p className="text-xs text-gray-500 font-medium">Review online public donations, Razorpay order IDs, and philanthropic statistics.</p>
        </div>

        {/* RUNNING TOTAL CARD */}
        <div className="bg-emerald-500 text-white p-4 rounded-3xl shadow-sm flex items-center space-x-4 shrink-0">
          <div className="p-3 bg-white/20 rounded-2xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-100">Filtered Paid Total</p>
            <h3 className="text-2xl font-extrabold font-mono text-white">₹ {runningTotal.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-orange-100 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search donor name, email, phone, or payment ID..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-primary"
          />
        </div>

        {/* Date Filter Inputs */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
          />
          <span className="text-xs text-gray-400 font-bold">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['all', 'paid', 'created', 'failed', 'refunded'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`
                px-3 py-2 rounded-2xl text-xs font-bold capitalize transition cursor-pointer shrink-0
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
          <p className="text-xs font-bold text-gray-400">Loading donation receipts...</p>
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-orange-100 text-center space-y-2">
          <HeartHandshake size={40} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-slate-700 font-baloo">No Donations Found</p>
          <p className="text-xs text-gray-400">No donation records match the active filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-100 font-mono text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="py-3.5 px-6">Donor Details</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4">Razorpay Reference</th>
                  <th className="py-3.5 px-6 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/50 transition">
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm font-baloo">{don.donor_name || 'Anonymous Philanthropist'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{don.donor_email || don.donor_phone || 'Direct Donation'}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-extrabold text-slate-800 text-sm">
                      ₹ {Number(don.amount).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono
                        ${don.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                        ${don.status === 'created' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                        ${don.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                        ${don.status === 'refunded' ? 'bg-slate-100 text-slate-600 border-slate-200' : ''}
                      `}>
                        {don.status || 'paid'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px] select-all">
                      {don.razorpay_payment_id || don.razorpay_order_id || 'rzp_direct_pay'}
                    </td>

                    <td className="py-4 px-6 text-right text-gray-500 font-mono text-[11px]">
                      {new Date(don.created_at || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredDonations.map((don) => (
              <div key={don.id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-3 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 font-baloo">{don.donor_name || 'Anonymous Donor'}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">{don.donor_email || don.donor_phone || 'UPI / Razorpay'}</p>
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600 text-sm">₹ {Number(don.amount).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-2 border-t">
                  <span>REF: {don.razorpay_payment_id || 'N/A'}</span>
                  <span>{new Date(don.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TODO: Razorpay webhook integration for automated refunds / status reconciliations */}

    </div>
  );
}
