import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/utils/supabase';
import { 
  Dog, 
  HeartHandshake, 
  Users, 
  FileCheck2, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    activeAnimals: 0,
    monthDonationsCount: 0,
    monthDonationsTotal: 0,
    pendingVolunteers: 0,
    pendingAdoptions: 0,
    unreadMessages: 0
  });

  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOverviewStats() {
      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // 1. Active animals count
        const { count: animalCount, error: animalErr } = await supabase
          .from('animals')
          .select('id', { count: 'exact', head: true })
          .in('status', ['rescued', 'under_treatment', 'fostered']);

        // 2. Monthly donations (sum & count)
        const { data: donationsData, count: donCount, error: donErr } = await supabase
          .from('donations')
          .select('amount, status, created_at')
          .gte('created_at', firstDayOfMonth)
          .eq('status', 'paid');

        const monthTotal = donationsData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

        // 3. Pending volunteer applications count
        const { count: volCount, error: volErr } = await supabase
          .from('volunteers')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        // 4. Pending adoption requests count
        const { count: adoptCount, error: adoptErr } = await supabase
          .from('adoption_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        // 5. Unread contact messages count
        const { count: msgCount, error: msgErr } = await supabase
          .from('contact_messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_read', false);

        // Fetch top recent donations for audit feed
        const { data: recentDon } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          activeAnimals: animalCount || 0,
          monthDonationsCount: donCount || 0,
          monthDonationsTotal: monthTotal,
          pendingVolunteers: volCount || 0,
          pendingAdoptions: adoptCount || 0,
          unreadMessages: msgCount || 0
        });

        setRecentDonations(recentDon || []);

      } catch (err: any) {
        console.error('Overview fetch error:', err);
        setError(err.message || 'Failed to load live overview metrics');
      } finally {
        setLoading(false);
      }
    }

    fetchOverviewStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-sans">
        <Loader2 size={36} className="animate-spin text-primary mx-auto" />
        <p className="text-sm font-bold font-baloo text-slate-800">Calculating NGO Operations Overview</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* HEADER BANNER */}
      <div className="bg-[#1C1C2E] text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-white/5">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] bg-primary text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
            Athiaa Live Command Console
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-baloo leading-tight">NGO Operations Overview</h1>
          <p className="text-xs text-gray-300 font-medium">Real-time metrics, rescue counts, and philanthropy telemetry across India.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* STAT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: Active Animals */}
        <Link to="/admin/animals" className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-primary group-hover:text-white transition">
              <Dog size={24} />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              Active Cases <ArrowUpRight size={12} />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold font-baloo text-slate-800">{stats.activeAnimals}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Injured & in-recovery strays</p>
          </div>
        </Link>

        {/* CARD 2: Monthly Philanthropic Total */}
        <Link to="/admin/donations" className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <HeartHandshake size={24} />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              This Month <ArrowUpRight size={12} />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold font-baloo text-slate-800">₹ {stats.monthDonationsTotal.toLocaleString()}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{stats.monthDonationsCount} completed Razorpay donations</p>
          </div>
        </Link>

        {/* CARD 3: Pending Volunteers */}
        <Link to="/admin/volunteers" className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              Pending App <ArrowUpRight size={12} />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold font-baloo text-slate-800">{stats.pendingVolunteers}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Volunteer signups awaiting approval</p>
          </div>
        </Link>

        {/* CARD 4: Pending Adoption Requests */}
        <Link to="/admin/adoptions" className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <FileCheck2 size={24} />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              Pending Review <ArrowUpRight size={12} />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold font-baloo text-slate-800">{stats.pendingAdoptions}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Adoption applications submitted</p>
          </div>
        </Link>

        {/* CARD 5: Unread Contact Messages */}
        <Link to="/admin/messages" className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition space-y-4 group">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <MessageSquare size={24} />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              Triage Inbox <ArrowUpRight size={12} />
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold font-baloo text-slate-800">{stats.unreadMessages}</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Unread general citizen queries</p>
          </div>
        </Link>

      </div>

      {/* RECENT DONATIONS FEED */}
      <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="font-baloo text-lg font-bold text-slate-800">Recent Financial Receipts</h3>
          <Link to="/admin/donations" className="text-xs font-bold text-primary hover:underline">View All</Link>
        </div>

        {recentDonations.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No recent donation entries found.</p>
        ) : (
          <div className="space-y-3">
            {recentDonations.map((don) => (
              <div key={don.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl text-xs font-sans">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">{don.donor_name || don.donor_email || 'Anonymous Philanthropist'}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {new Date(don.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold font-mono text-emerald-600 text-sm">₹ {Number(don.amount).toLocaleString()}</p>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {don.status || 'paid'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
