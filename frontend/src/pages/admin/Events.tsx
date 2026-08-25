
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEvents, useEventMutations } from '@/lib/hooks/useEvents';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Plus, Edit2, Calendar, MapPin, Save, ShieldCheck } from 'lucide-react';

export default function EventManagementPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { events, isLoading, mutate } = useEvents({ upcoming: false });
  const { createEvent, updateEvent } = useEventMutations();
  const { toast, showToast } = useToast();

  const [formMode, setFormMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('upcoming');
  const [capacity, setCapacity] = useState('100');
  const [pricing, setPricing] = useState('1'); // Positive number required
  const [imageUrl, setImageUrl] = useState('');

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  const handleOpenEdit = (e: any) => {
    setEditingId(e.id);
    setTitle(e.title || '');
    setSlug(e.slug || '');
    setDescription(e.description || '');
    setLocation(e.location || '');
    
    setStartDate(e.start_date ? new Date(e.start_date).toISOString().slice(0, 16) : '');
    setEndDate(e.end_date ? new Date(e.end_date).toISOString().slice(0, 16) : '');
    
    setStatus(e.status || 'upcoming');
    setCapacity(String(e.capacity || 100));
    setPricing(String(e.pricing || 1));
    setImageUrl(e.image_url || '');
    setFormMode('edit');
  };

  const handleOpenCreate = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setStatus('upcoming');
    setCapacity('100');
    setPricing('1');
    setImageUrl('');
    setFormMode('create');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim() || !location.trim()) {
      showToast('Title, slug, and location are required.', 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('End date must be greater than or equal to start date.', 'error');
      return;
    }

    const payload = {
      title,
      slug,
      description: description || null,
      location,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      status,
      capacity: parseInt(capacity) || null,
      pricing: parseFloat(pricing) || 1,
      image_url: imageUrl || null
    };

    try {
      if (formMode === 'create') {
        await createEvent(payload);
        showToast('Event created successfully!', 'success');
      } else if (formMode === 'edit' && editingId) {
        await updateEvent(editingId, payload);
        showToast('Event directory updated successfully!', 'success');
      }
      mutate();
      setFormMode('list');
    } catch (err: any) {
      showToast(err.message || 'Error occurred while saving event.', 'error');
    }
  };

  return (
    <div id="events-mgmt-panel" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Link to="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-gray-600">Events</span>
          </div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Community Events Hub</h1>
          <p className="text-xs text-gray-500">Regulate foster meetups, volunteer orientations, and physical fundraisers.</p>
        </div>

        {formMode === 'list' && (
          <button
            id="create-event-btn"
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition font-baloo shadow-sm shrink-0 font-baloo"
          >
            <Plus size={16} /> Schedule Event
          </button>
        )}
      </div>

      {formMode !== 'list' ? (
        /* EDIT OR CREATE FORM BOX */
        <div className="bg-white p-6 max-w-2xl mx-auto rounded-3xl border border-orange-50 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-baloo text-lg font-bold text-slate-800">
              {formMode === 'create' ? 'Create Community Event' : 'Edit Event Parameters'}
            </h3>
            <button
              onClick={() => setFormMode('list')}
              className="text-xs font-bold text-gray-450 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Dog Adoption Fair"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Slug (lowercase-hyphened) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. dog-adoption-fair"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none font-mono text-slate-850"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Physical Venue Location *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. cubbon park, Bangalore"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none text-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Operational Status *</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none text-slate-705 font-bold"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase font-mono">Start Timestamp *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-700 font-mono"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase font-mono">End Timestamp *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-505 uppercase">Max Spots (Capacity)</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-505 uppercase">Entry Fee Pricing (INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1 block">
              <label className="text-[10px] font-bold text-gray-505 uppercase">Short Event Pitch Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pitch what attendees should bring, schedule notes..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary/50 text-slate-755 leading-relaxed"
              />
            </div>

            <div className="space-y-1 block">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Banner Cover Asset</label>
              <FileUpload
                bucket="event-covers"
                path="covers"
                currentUrl={imageUrl || undefined}
                onUploadComplete={(result) => {
                  if (result) setImageUrl(result.public_url);
                  else setImageUrl('');
                }}
                onError={(err) => showToast(err, 'error')}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow"
            >
              <Save size={14} className="inline mr-1" /> Commit Agenda
            </button>
          </form>
        </div>
      ) : (
        /* EVENT LISTING LAYOUT CARDS SYSTEM */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-xs font-bold text-gray-400 font-mono">Loading dynamic events directories...</div>
          ) : events && events.length > 0 ? (
            events.map((e) => (
              <div id={`event-card-${e.id}`} key={e.id} className="bg-white rounded-3xl border border-orange-50 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-video bg-neutral-100">
                  <img src={e.image_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400'} alt={e.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                      e.status === 'upcoming' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                      e.status === 'ongoing' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      e.status === 'completed' ? 'bg-slate-50 text-slate-700 border-slate-100' :
                      'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left font-sans text-xs">
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-sm text-slate-850 line-clamp-1 font-baloo">{e.title}</h4>
                    
                    <div className="flex flex-col gap-1 text-[11px] text-gray-400 font-semibold font-mono pb-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(e.start_date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {e.location}
                      </span>
                    </div>

                    <p className="text-gray-450 text-[11px] leading-relaxed line-clamp-2">{e.description || 'No detailed descriptive criteria shared yet.'}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between text-[10px] font-bold font-mono text-gray-500 pb-2">
                      <span>Max Spot Limits: {e.capacity || 'Unlimited'}</span>
                      <span className="text-emerald-600 font-extrabold uppercase">Ticket: ₹{e.pricing}</span>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(e)}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1 border border-slate-205 transition cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit Schedule & Cover
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium select-none bg-white border border-dashed rounded-3xl">No events scheduled.</div>
          )}
        </div>
      )}
    </div>
  );
}
