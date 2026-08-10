
import React, { useState } from 'react';
import { apiFetch } from '@/lib/api/clientApi';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '@/lib/hooks/useAuth';
import { useVolunteers, useVolunteerMutations } from '@/lib/hooks/useVolunteers';
import { defaultFetcher } from '@/lib/hooks/fetcher';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { ChevronDown, ChevronUp, Save, Briefcase, Calendar, CheckSquare, Plus } from 'lucide-react';

export default function VolunteersConsolePage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast, showToast } = useToast();
  const { updateVolunteer } = useVolunteerMutations();

  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Task creation local states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskScheduledDate, setTaskScheduledDate] = useState(new Date().toISOString().split('T')[0]);

  const { volunteers, isLoading: volLoading, mutate } = useVolunteers({
    status: statusFilter || undefined
  });

  // Fetch expanded volunteer's tasks dynamically inside the component scope via useSWR
  const { data: vTasksData, mutate: mutateTasks } = useSWR(
    expandedId ? `/api/volunteers/${expandedId}/tasks` : null,
    defaultFetcher
  );

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateVolunteer(id, { status: status as any });

      if (user?.id) {
        try {
          const { supabase } = await import('../../utils/supabase');
          await supabase.from('audit_logs').insert({
            actor_id: user.id,
            action: `UPDATE_VOLUNTEER_STATUS_${status.toUpperCase()}`,
            table_name: 'volunteers',
            record_id: id,
            details: { status, updated_at: new Date().toISOString() }
          });
        } catch (e) {
          console.warn('Audit log write note:', e);
        }
      }

      showToast('Volunteer status updated successfully!', 'success');
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddTask = async (e: React.FormEvent, volunteerId: string) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const res = await apiFetch(`/api/volunteers/${volunteerId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc || null,
          scheduled_date: new Date(taskScheduledDate).toISOString()
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Task deployment failed');
      }

      showToast('Task assigned to volunteer successfully!', 'success');
      setTaskTitle('');
      setTaskDesc('');
      mutateTasks();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign task', 'error');
    }
  };

  return (
    <div id="volunteers-console" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-gray-600">Volunteers</span>
        </div>
        <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Volunteer Operations Registry</h1>
        <p className="text-xs text-gray-500">Regulate, verify status, and assign field rescues or kennel tasks to active members.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Filter Volunteer Registry:</span>
        <select
          id="volunteer-status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none text-slate-750 font-bold min-w-[160px]"
        >
          <option value="">All Applications</option>
          <option value="pending">Pending Review</option>
          <option value="active">Active Members</option>
          <option value="inactive">Inactive</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Volunteers Listing */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden text-left">
        {volLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-400 font-mono">Loading volunteer registry files...</div>
        ) : volunteers && volunteers.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="volunteers-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6">Name / Sourced Contacts</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4">Skills & Forte</th>
                  <th className="py-4 px-4">Availability</th>
                  <th className="py-4 px-6 text-right">Agenda Assignments</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650 font-medium">
                {volunteers.map((vol) => {
                  const isExpanded = expandedId === vol.id;
                  return (
                    <React.Fragment key={vol.id}>
                      <tr id={`volunteer-row-${vol.id}`} className={`hover:bg-slate-50/50 ${isExpanded ? 'bg-orange-50/10' : ''}`}>
                        <td className="py-4 px-6">
                          <p className="font-extrabold text-slate-800 text-sm font-baloo">{(vol as any).full_name || 'Athiaa Member'}</p>
                          <p className="text-[10px] text-gray-405 font-mono">{(vol as any).email || 'No email registered'}</p>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <select
                            id={`status-select-${vol.id}`}
                            value={vol.status}
                            onChange={(e) => handleStatusChange(vol.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 outline-none text-[11px] p-2 rounded-xl text-slate-700 font-bold"
                          >
                            <option value="pending">Pending Review</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          {vol.skills && vol.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {vol.skills.map((sk: string, i: number) => (
                                <span key={i} className="bg-slate-50 border text-[9.5px] px-1.5 py-0.5 rounded-md font-semibold text-slate-550 capitalize">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 font-semibold">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 max-w-[200px] truncate text-slate-500 font-semibold">
                          {vol.availability || 'As Needed'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            id={`agenda-tasks-btn-${vol.id}`}
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedId(null);
                              } else {
                                setExpandedId(vol.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[11px] border border-slate-205 transition cursor-pointer font-bold"
                          >
                            {isExpanded ? (
                              <>Hide Dashboard <ChevronUp size={12} /></>
                            ) : (
                              <>Manage Tasks <ChevronDown size={12} /></>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Task Panel area */}
                      {isExpanded && (
                        <tr id={`volunteer-tasks-panel-${vol.id}`} className="bg-slate-50/40">
                          <td colSpan={5} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-left bg-white p-5 rounded-2xl border border-dashed border-orange-100 items-start">
                              
                              {/* Left side: assigned tasks */}
                              <div className="space-y-4 font-sans">
                                <h4 className="font-extrabold text-slate-800 text-sm font-baloo border-b pb-1">
                                  Assigned Operations Directory
                                </h4>

                                {vTasksData && vTasksData.data && vTasksData.data.length > 0 ? (
                                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                    {(vTasksData.data as any[]).map((tsk) => (
                                      <div key={tsk.id} className="p-3 bg-slate-50 border rounded-xl space-y-1">
                                        <div className="flex justify-between items-start">
                                          <p className="font-extrabold text-slate-800">{tsk.title}</p>
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                            tsk.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            tsk.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                            'bg-amber-50 text-amber-700 border border-amber-100'
                                          }`}>
                                            {tsk.status}
                                          </span>
                                        </div>
                                        <p className="text-gray-400 text-[10.5px] leading-relaxed">{tsk.description || 'No instructions specified.'}</p>
                                        <p className="text-[9px] font-mono text-gray-400 pt-1">
                                          Due: {new Date(tsk.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-405 font-medium select-none py-8 bg-neutral-50 rounded-xl border text-center border-dashed">
                                    No live tasks deployment logged in database.
                                  </p>
                                )}
                              </div>

                              {/* Right side: Deploy new task */}
                              <form onSubmit={(e) => handleAddTask(e, vol.id)} className="space-y-3">
                                <h4 className="font-extrabold text-slate-800 text-sm font-baloo border-b pb-1">
                                  Deploy New Special Task
                                </h4>

                                <div className="space-y-1 block">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono">Task Title *</label>
                                  <input
                                    id="task-title-input"
                                    type="text"
                                    required
                                    value={taskTitle}
                                    onChange={(e) => setTaskTitle(e.target.value)}
                                    placeholder="e.g. Kennel feeding morning shifts"
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-800 outline-none"
                                  />
                                </div>

                                <div className="space-y-1 block">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono">Description / Instructions</label>
                                  <textarea
                                    id="task-desc-input"
                                    rows={2}
                                    value={taskDesc}
                                    onChange={(e) => setTaskDesc(e.target.value)}
                                    placeholder="Instructions regarding veterinary routes, dog profiles, addresses..."
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 outline-none font-medium leading-relaxed"
                                  />
                                </div>

                                <div className="space-y-1 block">
                                  <label className="text-[9px] font-bold text-gray-500 uppercase font-mono">Target Due Date *</label>
                                  <input
                                    id="task-date-input"
                                    type="date"
                                    required
                                    value={taskScheduledDate}
                                    onChange={(e) => setTaskScheduledDate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-semibold text-slate-700"
                                  />
                                </div>

                                <button
                                  id="deploy-task-btn"
                                  type="submit"
                                  className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer text-xs uppercase tracking-wider font-baloo shadow-sm"
                                >
                                  Deploy Task Assignment
                                </button>
                              </form>

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
          <div className="p-16 text-center text-slate-400 font-medium select-none">No volunteers listed.</div>
        )}
      </div>

    </div>
  );
}
