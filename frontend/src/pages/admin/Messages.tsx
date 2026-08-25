
import React, { useState } from 'react';
import { apiFetch } from '@/lib/api/clientApi';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { useAuth } from '@/lib/hooks/useAuth';
import { defaultFetcher } from '@/lib/hooks/fetcher';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Mail, MailOpen, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';

export default function ContactMessagesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast, showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: fetchResult, isLoading, mutate } = useSWR(
    isAdmin ? '/api/contact' : null,
    defaultFetcher
  );

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await apiFetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !currentRead })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || 'Message status update failed');
      }
      showToast(currentRead ? 'Message marked as unread.' : 'Message marked as read!', 'success');
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const messagesList = (fetchResult?.data as any[]) || [];

  const filteredMessages = messagesList.filter((msg) => {
    if (statusFilter === 'read' && !msg.is_read) return false;
    if (statusFilter === 'unread' && msg.is_read) return false;
    return true;
  });

  return (
    <div id="messages-console-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-gray-600">Messages</span>
        </div>
        <h1 className="text-3xl font-extrabold font-baloo text-slate-800 flex items-center gap-2">
          <Mail className="text-indigo-650" size={28} /> Inbound Feedback Logs
        </h1>
        <p className="text-xs text-gray-500">Respond to direct public queries, foster program offers, and donation clarifications.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Filter Inbound Messages:</span>
        <select
          id="message-read-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs outline-none text-slate-700 font-bold min-w-[160px]"
        >
          <option value="">All Inquiries</option>
          <option value="unread">Unread Only</option>
          <option value="read">Read Only</option>
        </select>
      </div>

      {/* Message Registry Table */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden text-left">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-bold text-gray-404 font-mono">Gathering inbound registers...</div>
        ) : filteredMessages && filteredMessages.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="messages-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6">Sender Details</th>
                  <th className="py-4 px-4">Subject Title</th>
                  <th className="py-4 px-4 text-center">Inquiry Category</th>
                  <th className="py-4 px-4 text-center">Live Status</th>
                  <th className="py-4 px-4 text-center">Time Sourced</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-655 font-medium">
                {filteredMessages.map((msg) => {
                  const isExpanded = expandedId === msg.id;
                  return (
                    <React.Fragment key={msg.id}>
                      <tr id={`msg-row-${msg.id}`} className={`hover:bg-slate-50/50 ${isExpanded ? 'bg-orange-50/10' : ''} ${!msg.is_read ? 'bg-indigo-50/15' : ''}`}>
                        <td className="py-3.5 px-6 font-bold text-slate-800">
                          <p className="text-sm font-semibold">{msg.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{msg.email}</p>
                          {msg.phone && (
                            <p className="text-[9.5px] text-gray-450 font-mono font-semibold">{msg.phone}</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-750 font-semibold">
                          {msg.subject || 'Direct General Inquiry'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-50 border font-bold capitalize text-[10px] text-slate-600">
                            {msg.category || 'general'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {msg.is_read ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                              <MailOpen size={10} /> Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide animate-pulse">
                              <Mail size={10} /> Unread
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-gray-400">
                          {new Date(msg.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3.5 px-6 text-right space-x-1">
                          <button
                            id={`read-toggle-btn-${msg.id}`}
                            onClick={() => handleToggleRead(msg.id, msg.is_read)}
                            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-2 rounded-xl border transition cursor-pointer select-none ${
                              msg.is_read 
                                ? 'bg-slate-50 hover:bg-slate-100 text-slate-605 border-slate-205'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-705 border-emerald-150'
                            }`}
                          >
                            {msg.is_read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          
                          <button
                            id={`expand-msg-btn-${msg.id}`}
                            onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                            className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-[11px] border border-slate-205 transition cursor-pointer font-extrabold"
                          >
                            {isExpanded ? (
                              <>Hide <ChevronUp size={11} /></>
                            ) : (
                              <>View <ChevronDown size={11} /></>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable message payload drawer wrapper */}
                      {isExpanded && (
                        <tr id={`msg-expanded-drawer-${msg.id}`} className="bg-slate-50/40">
                          <td colSpan={6} className="p-6">
                            <div className="bg-white p-5 rounded-2xl border border-dashed text-left space-y-3.5">
                              <div className="border-b pb-1">
                                <p className="text-[10px] font-bold text-gray-405 font-mono uppercase">Inquiry Message Body</p>
                                <h4 className="font-extrabold text-slate-800 text-sm font-baloo">{msg.subject || 'Direct General Inquiry'}</h4>
                              </div>

                              <p className="text-slate-700 leading-relaxed font-semibold text-xs whitespace-pre-wrap">
                                {msg.message || 'The user did not provide any detailed message text.'}
                              </p>

                              <div className="pt-2 text-[10px] text-gray-400 font-mono font-bold flex gap-4">
                                <span>Sender Email: {msg.email}</span>
                                {msg.phone && <span>Sender Phone: {msg.phone}</span>}
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
          <div className="p-16 text-center text-slate-400 font-semibold select-none">No messages matching current filters.</div>
        )}
      </div>

    </div>
  );
}
