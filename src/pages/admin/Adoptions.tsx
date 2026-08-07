
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAdoptions, useAdoptionMutations } from '@/lib/hooks/useAdoptions';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { ChevronDown, ChevronUp, Save, Filter } from 'lucide-react';

export default function AdoptionApplicationsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast, showToast } = useToast();
  const { updateApplication } = useAdoptionMutations();

  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Status-updating inputs
  const [updateStatus, setUpdateStatus] = useState<any>({});
  const [adminNotes, setAdminNotes] = useState<any>({});

  const { applications, isLoading, mutate } = useAdoptions({
    status: statusFilter || undefined
  });

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const toggleRow = (id: string, currentStatus: string, currentNotes: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Pre-fill updating inputs
      setUpdateStatus((prev: any) => ({ ...prev, [id]: currentStatus }));
      setAdminNotes((prev: any) => ({ ...prev, [id]: currentNotes || '' }));
    }
  };

  const handleUpdate = async (id: string) => {
    const status = updateStatus[id];
    const notes = adminNotes[id];

    try {
      await updateApplication(id, {
        status,
        notes
      });
      showToast('Application updated successfully!', 'success');
      setExpandedId(null);
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Failed to update application', 'error');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-100',
    reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-700 border-rose-100',
    completed: 'bg-slate-150 text-slate-700 border-slate-200',
    withdrawn: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  return (
    <div id="adoptions-page-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-gray-600">Adoptions</span>
        </div>
        <h1 className="text-3xl font-extrabold font-baloo text-slate-800 font-baloo">Adoption Applications</h1>
        <p className="text-xs text-gray-500">Review candidate compatibility profiles and update file approvals.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter size={14} className="text-gray-400" />
          <span>Status Filter:</span>
        </div>
        <select
          id="adoption-status-dropdown"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none focus:border-primary/50 text-slate-700 font-bold min-w-[160px]"
        >
          <option value="">All Applications</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {/* Table listing */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-400 font-mono">Loading adoptions list...</div>
        ) : applications && applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="adoptions-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6">Dog Name</th>
                  <th className="py-4 px-4">Applicant Name</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-center">Submitted At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650 font-medium">
                {applications.map((app) => {
                  const isExpanded = expandedId === app.id;
                  return (
                    <React.Fragment key={app.id}>
                      <tr id={`app-row-${app.id}`} className={`hover:bg-slate-50/50 ${isExpanded ? 'bg-orange-50/10' : ''}`}>
                        <td className="py-3 px-6 font-bold text-slate-800 text-sm">{app.dog?.name || 'Listed Dog'}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{app.applicant_name}</td>
                        <td className="py-3 px-4 text-slate-500">{app.applicant_email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusColors[app.status] || 'bg-gray-100 text-gray-700'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[10px] text-gray-450">
                          {new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <button
                            id={`expand-app-${app.id}`}
                            onClick={() => toggleRow(app.id, app.status, app.notes || '')}
                            className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[11.5px] border border-slate-205 transition cursor-pointer font-bold"
                          >
                            {isExpanded ? (
                              <>Collapse <ChevronUp size={12} /></>
                            ) : (
                              <>View Details <ChevronDown size={12} /></>
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded View */}
                      {isExpanded && (
                        <tr id={`app-expanded-row-${app.id}`} className="bg-slate-50/40">
                          <td colSpan={6} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left bg-white p-5 rounded-2xl border border-dashed border-orange-100">
                              
                              {/* Applicant profiles details */}
                              <div className="space-y-3 font-sans">
                                <p className="font-extrabold text-slate-800 text-sm font-baloo border-b pb-1">Applicant Profile Contacts</p>
                                <p><span className="font-bold text-gray-500 uppercase font-mono text-[9px]">Phone:</span> {app.applicant_phone}</p>
                                <p><span className="font-bold text-gray-500 uppercase font-mono text-[9px]">Housing Scene:</span> <span className="text-slate-700 leading-relaxed block bg-slate-50 p-2.5 rounded-lg border mt-1 font-medium">{app.living_situation}</span></p>
                                <p><span className="font-bold text-gray-500 uppercase font-mono text-[9px]">Experience Level:</span> <span className="text-slate-700 leading-relaxed block bg-slate-50 p-2.5 rounded-lg border mt-1 font-medium">{app.experience_level}</span></p>
                              </div>

                              {/* Administrative updates form */}
                              <div className="space-y-4">
                                <p className="font-extrabold text-slate-800 text-sm font-baloo border-b pb-1">Administrator Reviews</p>
                                
                                <div className="space-y-1 block max-w-sm">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono">Transition Application Status</label>
                                  <select
                                    id={`app-status-update-${app.id}`}
                                    value={updateStatus[app.id]}
                                    onChange={(e) => setUpdateStatus((prev: any) => ({ ...prev, [app.id]: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-705 outline-none"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Reviewing</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="completed">Completed</option>
                                    <option value="withdrawn">Withdrawn</option>
                                  </select>
                                </div>

                                <div className="space-y-1 block">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono">Private Admin Evaluation & Case Notes</label>
                                  <textarea
                                    id={`app-notes-update-${app.id}`}
                                    rows={3}
                                    value={adminNotes[app.id]}
                                    onChange={(e) => setAdminNotes((prev: any) => ({ ...prev, [app.id]: e.target.value }))}
                                    placeholder="Enter administrative case notes regarding home checks or interview calls..."
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl leading-relaxed text-slate-705 outline-none focus:border-primary/50 font-semibold"
                                  />
                                </div>

                                <button
                                  id={`app-save-btn-${app.id}`}
                                  onClick={() => handleUpdate(app.id)}
                                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide font-baloo shadow"
                                >
                                  <Save size={14} /> Commit Changes & Revalidate
                                </button>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 font-medium select-none">No applications logged in system.</div>
        )}
      </div>

    </div>
  );
}
