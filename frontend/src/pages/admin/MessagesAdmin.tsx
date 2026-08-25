import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { 
  MessageSquare, 
  Search, 
  Mail, 
  Clock, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  Eye
} from 'lucide-react';

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected message detail view modal
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  // Fetch Contact Messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter === 'unread') {
        query = query.eq('is_read', false);
      } else if (statusFilter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Fetch messages error:', err);
      setError(err.message || 'Failed to query contact messages triage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  // Expand & mark as read
  const handleOpenMessage = async (msg: any) => {
    setSelectedMessage(msg);

    if (!msg.is_read) {
      try {
        await supabase
          .from('contact_messages')
          .update({ is_read: true })
          .eq('id', msg.id);

        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch (err) {
        console.error('Mark read error:', err);
      }
    }
  };

  // Filtered by Search
  const filteredMessages = messages.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (m.name || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    const subject = (m.subject || '').toLowerCase();
    const body = (m.message || '').toLowerCase();
    return name.includes(q) || email.includes(q) || subject.includes(q) || body.includes(q);
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Contact Messages Triage</h1>
          <p className="text-xs text-gray-500 font-medium">Review public inquiries, emergency triage notes, and general citizen communications.</p>
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
            placeholder="Search sender, email, or message body..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'unread', 'read'].map((st) => (
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
          <p className="text-xs font-bold text-gray-400">Loading citizen messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-orange-100 text-center space-y-2">
          <MessageSquare size={40} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-slate-700 font-baloo">No Messages Found</p>
          <p className="text-xs text-gray-400">Your triage inbox is empty for this view filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-100 font-mono text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="py-3.5 px-6">Sender Details</th>
                  <th className="py-3.5 px-4">Subject / Category</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    onClick={() => handleOpenMessage(msg)}
                    className={`hover:bg-slate-50 transition cursor-pointer ${!msg.is_read ? 'bg-orange-50/20 font-bold' : ''}`}
                  >
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm font-baloo">{msg.name || 'Citizen Caretaker'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{msg.email || msg.phone || 'Direct Message'}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {msg.subject || msg.category || 'General Query'}
                    </td>

                    <td className="py-4 px-4 text-gray-500 max-w-[280px] truncate">
                      {msg.message || 'No message content body.'}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono
                        ${msg.is_read ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-100 text-amber-800 border-amber-300'}
                      `}>
                        {msg.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition">
                        <Eye size={14} /> Open Triage
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => handleOpenMessage(msg)}
                className={`bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-3 text-left cursor-pointer ${!msg.is_read ? 'bg-orange-50/30 border-orange-200' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 font-baloo">{msg.name || 'Citizen'}</h4>
                    <p className="text-xs font-bold text-slate-700">{msg.subject || 'General Influx'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border font-mono`}>
                    {msg.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2">{msg.message}</p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* FULL MESSAGE DETAILS MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-orange-100 text-left font-sans">
            
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  {selectedMessage.category || 'Public Query'}
                </span>
                <h3 className="font-baloo font-bold text-xl text-slate-800 mt-1">{selectedMessage.subject || 'No Subject'}</h3>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-slate-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-slate-800">Sender: {selectedMessage.name || 'Anonymous Caretaker'}</p>
                <p className="text-gray-500 font-mono">Email: {selectedMessage.email || 'N/A'} | Phone: {selectedMessage.phone || 'N/A'}</p>
                <p className="text-[10px] text-gray-400 font-mono pt-1">
                  Received: {new Date(selectedMessage.created_at || Date.now()).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Full Message Text</label>
                <div className="p-4 bg-cream rounded-2xl text-xs leading-relaxed text-slate-800 font-medium whitespace-pre-wrap border border-orange-50">
                  {selectedMessage.message || 'No body text supplied.'}
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedMessage(null)}
                className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-2xl text-xs font-baloo cursor-pointer"
              >
                Close Triage Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
