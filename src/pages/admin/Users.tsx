
import React, { useState } from 'react';
import { apiFetch } from '@/lib/api/clientApi';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '@/lib/hooks/useAuth';
import { defaultFetcher } from '@/lib/hooks/fetcher';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Shield, ShieldAlert, UserCheck, UserMinus, Search, Filter } from 'lucide-react';

export default function UsersConsolePage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast, showToast } = useToast();

  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Fetch all user structures (restricted to super_admin on API layer)
  const isSuperAdmin = user?.role === 'super_admin';
  const { data: usersData, isLoading: usersLoading, mutate } = useSWR(
    isSuperAdmin ? '/api/admin/users' : null,
    defaultFetcher
  );

  if (authLoading) {
    return <AdminSkeleton />;
  }

  // Double lock: If they aren't a super admin, give them a helpful warning block
  if (!isSuperAdmin) {
    return (
      <div id="superadmin-denied" className="max-w-md mx-auto my-24 p-8 bg-white border border-rose-100 rounded-3xl text-center space-y-4 shadow-sm font-sans">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto text-lg">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-bold font-baloo text-slate-800">Super Admin Access Required</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          The Users Console contains sensitive system data and credential controls. It is restricted exclusively to the primary Super Administrators.
        </p>
        <Link
          id="denied-back-btn"
          to="/admin"
          className="inline-block bg-[#1C1C2E] text-white font-bold py-2.5 px-6 rounded-xl text-xs font-mono font-bold tracking-wide"
        >
          &larr; Back to Admin Console
        </Link>
      </div>
    );
  }

  const handleRoleChange = async (targetId: string, name: string, nextRole: string) => {
    if (window.confirm(`Change the authority role of "${name}" to "${nextRole}"?`)) {
      try {
        const res = await apiFetch(`/api/profile/${targetId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: nextRole })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error || 'Role elevation failed');
        }
        showToast(`Role for "${name}" successfully updated onto "${nextRole}"!`, 'success');
        mutate();
      } catch (err: any) {
        showToast(err.message || 'Operation failed', 'error');
      }
    }
  };

  const handleToggleBlock = async (targetId: string, name: string, currentActive: boolean) => {
    const nextActiveStatus = !currentActive;
    const actionPhrase = nextActiveStatus ? 'unblock / activate' : 'block / suspend';

    if (window.confirm(`Are you sure you want to ${actionPhrase} user "${name}"?`)) {
      try {
        const res = await apiFetch(`/api/profile/${targetId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: nextActiveStatus })
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json?.error || 'Active toggle failed');
        }
        showToast(`Successfully toggled account access of "${name}"!`, 'success');
        mutate();
      } catch (err: any) {
        showToast(err.message || 'Operation failed', 'error');
      }
    }
  };

  const usersList = (usersData?.data as any[]) || [];

  const filteredUsers = usersList.filter((usr) => {
    if (roleFilter && usr.role !== roleFilter) return false;
    if (searchFilter) {
      const matchText = `${usr.full_name || ''} ${usr.email || ''}`.toLowerCase();
      if (!matchText.includes(searchFilter.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div id="users-console-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-gray-600">Users</span>
        </div>
        <h1 className="text-3xl font-extrabold font-baloo text-slate-800 flex items-center gap-2">
          <Shield className="text-indigo-650" size={28} /> Users Credential Console
        </h1>
        <p className="text-xs text-gray-500">Coordinate user logins, promote staff permissions, block violating accounts.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            id="user-search-box"
            type="text"
            placeholder="Search credentials directory by name or email address..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-primary/50 text-xs py-3 px-4 rounded-xl font-medium text-slate-700"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <select
            id="user-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-primary/50 text-xs p-3 rounded-xl font-bold text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="volunteer">Volunteer</option>
            <option value="user">Regular User</option>
          </select>
        </div>
      </div>

      {/* Users Accounts List */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden text-left">
        {usersLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-405 font-mono">Querying compliance files...</div>
        ) : filteredUsers && filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="users-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6">Name / Sourced Profile</th>
                  <th className="py-4 px-4">Permission Level</th>
                  <th className="py-4 px-4 text-center">Login Access</th>
                  <th className="py-4 px-4 text-center">Registered Date</th>
                  <th className="py-4 px-6 text-right">Coordinate Rules</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-655 font-medium">
                {filteredUsers.map((usr) => (
                  <tr id={`user-row-${usr.id}`} key={usr.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6">
                      <p className="font-extrabold text-slate-800 text-sm font-baloo">{usr.full_name || 'Anonymous User'}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{usr.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {usr.id === user?.id ? (
                        <span className="px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-lg bg-orange-50 text-orange-700 border border-orange-100 font-mono">
                          You (Super Admin)
                        </span>
                      ) : (
                        <select
                          id={`role-select-${usr.id}`}
                          value={usr.role}
                          onChange={(e) => handleRoleChange(usr.id, usr.full_name || usr.email, e.target.value)}
                          disabled={usr.role === 'super_admin'}
                          className="bg-slate-50 border border-slate-200 text-[11px] font-bold p-1.5 rounded-xl text-slate-705 outline-none cursor-pointer focus:border-indigo-400 disabled:opacity-75"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="admin">Admin Staff</option>
                          <option value="volunteer">Volunteer Member</option>
                          <option value="user">Regular User</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 text-[9px] rounded-full font-bold uppercase tracking-wider border ${
                        usr.is_active !== false 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-110' 
                          : 'bg-rose-50 text-rose-700 border-rose-110'
                      }`}>
                        {usr.is_active !== false ? 'Live Access' : 'Blocked / Idle'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-gray-400">
                      {new Date(usr.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {usr.id !== user?.id && usr.role !== 'super_admin' ? (
                        <button
                          id={`block-btn-${usr.id}`}
                          onClick={() => handleToggleBlock(usr.id, usr.full_name || usr.email, usr.is_active !== false)}
                          className={`inline-flex items-center gap-1 font-bold px-3 py-1.5 rounded-xl text-[10.5px] border cursor-pointer select-none transition ${
                            usr.is_active !== false 
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-150' 
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-150'
                          }`}
                        >
                          {usr.is_active !== false ? (
                            <><UserMinus size={11} /> Block Account</>
                          ) : (
                            <><UserCheck size={11} /> Reinstate Account</>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-350 text-xs font-semibold font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 font-medium select-none bg-white border rounded-3xl">No profiles registered in database.</div>
        )}
      </div>

    </div>
  );
}
