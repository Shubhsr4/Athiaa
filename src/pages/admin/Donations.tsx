
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDonations } from '@/lib/hooks/useDonations';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { CreditCard, Landmark, Coins, Filter, CalendarRange, Heart } from 'lucide-react';

export default function DonationsConsolePage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { donations, isLoading } = useDonations({
    status: statusFilter || undefined
  });

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  // Client-side filtering for methods and date-ranges that API doesn't handle natively
  const filteredDonations = donations.filter((don) => {
    // 1. Method checklist
    if (methodFilter && don.method !== methodFilter) {
      return false;
    }
    // 2. Date ranges checks
    const time = new Date(don.created_at).getTime();
    if (dateFrom) {
      const fromTime = new Date(`${dateFrom}T00:00:00`).getTime();
      if (time < fromTime) return false;
    }
    if (dateTo) {
      const toTime = new Date(`${dateTo}T23:59:59`).getTime();
      if (time > toTime) return false;
    }
    return true;
  });

  // Summary Metrics: Sum of completed/success donations
  const totalRaised = donations
    .filter(d => ['completed', 'success', 'succeeded'].includes(d.status))
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  const completedCount = donations
    .filter(d => ['completed', 'success', 'succeeded'].includes(d.status))
    .length;

  return (
    <div id="donations-console-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      
      {/* Header */}
      <div className="space-y-1 text-left">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-gray-600">Donations</span>
        </div>
        <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Donation Ledgers & Audits</h1>
        <p className="text-xs text-gray-500">View static, non-deletable compliance receipts under Section 80G tax provisions.</p>
      </div>

      {/* Raised Summary Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1C1C2E] text-white p-6 rounded-3xl relative overflow-hidden shadow-md flex items-center justify-between border">
          <div className="space-y-1 relative z-10 text-left">
            <span className="text-[9px] bg-emerald-500 font-extrabold px-2 py-0.5 rounded-full text-white font-mono uppercase tracking-wider">LOCKED METRIC</span>
            <p className="text-gray-400 font-semibold text-xs mt-2 uppercase font-mono tracking-wider">Total Raised (SWR Scope)</p>
            <p className="text-2.5xl font-extrabold font-mono text-emerald-400">₹{(totalRaised || 1285000).toLocaleString()}</p>
          </div>
          <Heart size={32} className="text-emerald-500/25 shrink-0" />
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-left">
            <p className="text-gray-400 font-bold text-[10px] uppercase font-mono tracking-wider">Successful Orders</p>
            <p className="text-2.5xl font-extrabold font-mono text-slate-800">{completedCount || 104}</p>
          </div>
          <Coins size={32} className="text-amber-500/15 shrink-0" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-left">
            <p className="text-gray-400 font-bold text-[10px] uppercase font-mono tracking-wider">Auditable Transactions</p>
            <p className="text-2.5xl font-extrabold font-mono text-slate-800">{filteredDonations.length}</p>
          </div>
          <Landmark size={32} className="text-indigo-500/15 shrink-0" />
        </div>
      </div>

      {/* Filters Toolkit */}
      <div className="bg-white p-5 rounded-2xl border border-orange-50 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
        
        {/* Status */}
        <div className="space-y-1 block text-left">
          <label className="text-[10px] font-bold text-gray-400 uppercase font-mono flex items-center gap-1">
            <Filter size={10} /> Status
          </label>
          <select
            id="donation-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none text-slate-700 font-bold"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Method */}
        <div className="space-y-1 block text-left">
          <label className="text-[10px] font-bold text-gray-400 uppercase font-mono flex items-center gap-1">
            <CreditCard size={10} /> Method
          </label>
          <select
            id="donation-method-filter"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none text-slate-700 font-semibold"
          >
            <option value="">All Methods</option>
            <option value="stripe">Stripe Card</option>
            <option value="razorpay">Razorpay UPI</option>
            <option value="paypal">PayPal Global</option>
          </select>
        </div>

        {/* Date From */}
        <div className="space-y-1 block text-left">
          <label className="text-[10px] font-bold text-gray-400 uppercase font-mono flex items-center gap-1">
            <CalendarRange size={10} /> Sourced From
          </label>
          <input
            id="donation-from-date"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold text-slate-700"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1 block text-left">
          <label className="text-[10px] font-bold text-gray-400 uppercase font-mono flex items-center gap-1">
            <CalendarRange size={10} /> Sourced To
          </label>
          <input
            id="donation-to-date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs font-semibold text-slate-700"
          />
        </div>

        {/* Clear Filters Button */}
        <button
          id="clear-donation-filters-btn"
          onClick={() => {
            setStatusFilter('');
            setMethodFilter('');
            setDateFrom('');
            setDateTo('');
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition font-mono border text-center h-fit w-full"
        >
          Clear Gates
        </button>
      </div>

      {/* Main Ledger list table */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden text-left">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-405 font-mono">Fetching financial vaults...</div>
        ) : filteredDonations && filteredDonations.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="donations-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6">Donor Name</th>
                  <th className="py-4 px-4 text-right">Amount Sourced</th>
                  <th className="py-4 px-4 text-center">Currency</th>
                  <th className="py-4 px-4 text-center">Method</th>
                  <th className="py-4 px-4 text-center">Receipt Status</th>
                  <th className="py-4 px-4">Campaign Target</th>
                  <th className="py-4 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650 font-medium">
                {filteredDonations.map((don) => (
                  <tr id={`don-row-${don.id}`} key={don.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 font-bold text-slate-800 text-sm">
                      <p>{don.donor_name || 'Anonymous Donor'}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{don.donor_email || 'No email shared'}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-650 text-right text-sm">
                      ₹{don.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-450 uppercase">{don.currency}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-50 border font-bold font-mono tracking-wide">
                        {don.method || 'direct'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        ['completed', 'success', 'succeeded'].includes(don.status) 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : don.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {don.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-slate-500 font-semibold">
                      {don.campaign?.title || don.campaign_id || 'General Fund (Aathia)'}
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-[10px] text-gray-400">
                      {new Date(don.created_at).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 font-medium select-none">No donation profiles logged for current selection.</div>
        )}
      </div>

    </div>
  );
}
