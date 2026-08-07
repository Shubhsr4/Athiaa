
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAdminStats } from '@/lib/hooks/useAdminStats';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import RescueHeatmap from '@/src/components/admin/RescueHeatmap';
import { 
  Plus, 
  Trash2, 
  Activity, 
  Clock, 
  AlertCircle, 
  Users, 
  Dog as DogIcon, 
  MessageSquare, 
  Heart, 
  Calendar, 
  Settings, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

export default function AdminPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { stats, isLoading: statsLoading } = useAdminStats();

  if (authLoading || statsLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const s = stats || {
    total_dogs: 0,
    available_dogs: 0,
    active_volunteers: 0,
    donations_this_month: 0,
    pending_applications: 0,
    upcoming_events: 0,
    unread_messages: 0,
    recent_donations: [],
    recent_applications: []
  };

  return (
    <div id="aathia-admin-root" className="max-w-7xl mx-auto px-4 py-12 space-y-10 font-sans text-left">
      
      {/* Header section with Admin menu */}
      <div id="admin-header-card" className="bg-[#1C1C2E] text-white p-8 rounded-3xl relative overflow-hidden shadow-lg border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-red-650/15 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <span className="text-[10px] bg-red-500 text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider font-mono">
              Aathia NGO Secure Console
            </span>
            <h1 className="text-3xl md:text-4xl font-bold font-baloo leading-tight">NGO Operations Dashboard</h1>
            <p className="text-xs text-gray-400 font-medium">Coordinate foster programs, donations auditing, veterinary files, and adoptions.</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link 
              id="admin-home-btn"
              to="/"
              className="bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-xs font-bold transition text-white border border-white/5"
            >
              Public Website
            </Link>
            <Link 
              id="admin-account-btn"
              to="/dashboard"
              className="bg-primary hover:bg-primary-hover px-4 py-2.5 rounded-xl text-xs font-bold transition text-white"
            >
              My Account
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of operational sub-pages shortcuts */}
      <div id="admin-shortcuts-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Rescue Heatmap', href: '#rescue-heatmap-section', icon: AlertCircle, color: 'text-red-500 bg-red-50' },
          { label: 'Dog Fleet', href: '/admin/dogs', icon: DogIcon, color: 'text-amber-500 bg-amber-50' },
          { label: 'Adoptions', href: '/admin/adoptions', icon: Sparkles, color: 'text-indigo-500 bg-indigo-50' },
          { label: 'Donations', href: '/admin/donations', icon: Heart, color: 'text-rose-500 bg-rose-50' },
          { label: 'Campaigns', href: '/admin/campaigns', icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Events Hub', href: '/admin/events', icon: Calendar, color: 'text-sky-500 bg-sky-50' },
          { label: 'Blog Posts', href: '/admin/blog', icon: BookOpen, color: 'text-teal-500 bg-teal-50' },
          { label: 'Volunteers', href: '/admin/volunteers', icon: Users, color: 'text-purple-500 bg-purple-50' },
          { label: 'Users Console', href: '/admin/users', icon: Users, color: 'text-blue-500 bg-blue-50' },
          { label: 'Messages', href: '/admin/messages', icon: MessageSquare, color: 'text-orange-500 bg-orange-50' },
          { label: 'Site Settings', href: '/admin/settings', icon: Settings, color: 'text-slate-500 bg-slate-50' },
        ].map((item, id) => (
          <a
            id={`admin-shortcut-${id}`}
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center p-5 bg-white border border-orange-50 rounded-2xl hover:border-primary/30 hover:shadow-warm transition cursor-pointer text-center group"
          >
            <div className={`p-3 rounded-xl mb-3 transition group-hover:scale-105 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <span className="text-xs font-extrabold text-slate-700 font-baloo">{item.label}</span>
          </a>
        ))}
      </div>

      {/* Numerical statistics grid panel */}
      <div id="admin-stats-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Dogs Registered', value: s.total_dogs, icon: DogIcon, color: 'text-amber-600' },
          { label: 'Available for Adoption', value: s.available_dogs, icon: Sparkles, color: 'text-emerald-600' },
          { label: 'Donations This Month', value: `₹${(s.donations_this_month || 0).toLocaleString()}`, icon: Heart, color: 'text-rose-600' },
          { label: 'Pending Applications', value: s.pending_applications, icon: Activity, color: 'text-indigo-600' },
          { label: 'Active Volunteers', value: s.active_volunteers, icon: Users, color: 'text-sky-600' },
          { label: 'Upcoming Events Listed', value: s.upcoming_events, icon: Calendar, color: 'text-purple-600' },
          { label: 'Unread Feedback Messages', value: s.unread_messages, icon: MessageSquare, color: 'text-orange-600' },
        ].map((item, idx) => (
          <div id={`admin-stat-card-${idx}`} key={idx} className="bg-white p-5 rounded-3xl border border-orange-50 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono block">
                {item.label}
              </span>
              <span className="text-xl md:text-2xl font-extrabold font-mono text-slate-800">
                {item.value}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl bg-slate-50 ${item.color}`}>
              <item.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* D3 Rescue Heatmap Data Visualization Section */}
      <div id="rescue-heatmap-section" className="pt-2">
        <RescueHeatmap />
      </div>

      {/* Main operational tables section */}
      <div id="admin-tables-section" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent dog adoptions table */}
        <div id="admin-recent-applications-card" className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-baloo text-base font-bold text-slate-800">Recent Applications</h3>
            <Link 
              id="admin-viewall-apps-btn"
              to="/admin/adoptions" 
              className="text-[10px] font-bold text-primary hover:underline font-mono"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table id="admin-recent-applications-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="pb-2">Dog Name</th>
                  <th className="pb-2">Applicant</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600">
                {s.recent_applications && s.recent_applications.length > 0 ? (
                  s.recent_applications.map((app) => (
                    <tr id={`app-row-${app.id}`} key={app.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-800">{app.dog_name || 'N/A'}</td>
                      <td className="py-2.5 font-medium">{app.applicant_name}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          app.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          app.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                          app.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                          'bg-indigo-50 text-indigo-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-gray-400">
                        {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">No recent applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent direct donation records table */}
        <div id="admin-recent-donations-card" className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-baloo text-base font-bold text-slate-800">Recent Donations</h3>
            <Link 
              id="admin-viewall-donations-btn"
              to="/admin/donations" 
              className="text-[10px] font-bold text-primary hover:underline font-mono"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table id="admin-recent-donations-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="pb-2">Donor Name</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Currency</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600">
                {s.recent_donations && s.recent_donations.length > 0 ? (
                  s.recent_donations.map((don) => (
                    <tr id={`don-row-${don.id}`} key={don.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-800">{don.donor_name || 'Anonymous Donor'}</td>
                      <td className="py-2.5 font-bold text-emerald-600 text-right">₹{don.amount.toLocaleString()}</td>
                      <td className="py-2.5 text-center font-mono font-bold text-slate-500 uppercase">{don.currency}</td>
                      <td className="py-2.5 font-mono text-[10px] text-gray-400 text-right">
                        {new Date(don.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 font-medium">No recent donations yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
