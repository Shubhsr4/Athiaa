
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCampaigns, useCampaignMutations } from '@/lib/hooks/useCampaigns';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Plus, Edit2, CheckCircle2, XCircle, Save, Percent, Target } from 'lucide-react';

export default function CampaignManagementPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { campaigns, isLoading, mutate } = useCampaigns(false); // Passing false to load active list and inactive list
  const { createCampaign, updateCampaign } = useCampaignMutations();
  const { toast, showToast } = useToast();

  // Mode state: 'list' | 'create' | 'edit'
  const [formMode, setFormMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('100000');
  const [currency, setCurrency] = useState('INR');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

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

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateCampaign(id, { is_active: !current });
      showToast(`Campaign status updated successfully!`, 'success');
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setTitle(c.title || '');
    setSlug(c.slug || '');
    setDescription(c.description || '');
    setGoalAmount(String(c.goal_amount || 0));
    setCurrency(c.currency || 'INR');
    
    // Parse Date Strings for datetime inputs
    setStartDate(c.start_date ? new Date(c.start_date).toISOString().slice(0, 16) : '');
    setEndDate(c.end_date ? new Date(c.end_date).toISOString().slice(0, 16) : '');
    
    setImageUrl(c.image_url || '');
    setIsActive(c.is_active ?? true);
    setFormMode('edit');
  };

  const handleOpenCreate = () => {
    setTitle('');
    setSlug('');
    setDescription('');
    setGoalAmount('100000');
    setCurrency('INR');
    setStartDate('');
    setEndDate('');
    setImageUrl('');
    setIsActive(true);
    setFormMode('create');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      showToast('Title and Slug are required', 'error');
      return;
    }

    const payload = {
      title,
      slug,
      description: description || null,
      goal_amount: parseFloat(goalAmount) || 0,
      currency,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      image_url: imageUrl || null,
      is_active: isActive
    };

    try {
      if (formMode === 'create') {
        await createCampaign(payload);
        showToast('New Donation Campaign created successfully!', 'success');
      } else if (formMode === 'edit' && editingId) {
        await updateCampaign(editingId, payload);
        showToast('Campaign settings updated successfully!', 'success');
      }
      mutate();
      setFormMode('list');
    } catch (err: any) {
      showToast(err.message || 'Error saving campaign configurations', 'error');
    }
  };

  return (
    <div id="campaign-mgmt-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Link to="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-gray-600">Campaigns</span>
          </div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Operational Campaigns</h1>
          <p className="text-xs text-gray-500">Regulate crowdfunding and infrastructure fund bounds.</p>
        </div>

        {formMode === 'list' && (
          <button
            id="create-campaign-btn"
            onClick={handleOpenCreate}
            className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition font-baloo shadow-sm shrink-0"
          >
            <Plus size={16} /> Setup Campaign
          </button>
        )}
      </div>

      {formMode !== 'list' ? (
        /* EDIT OR CREATE FORM */
        <div className="bg-white p-6 max-w-2xl mx-auto rounded-3xl border border-orange-50 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-baloo text-lg font-bold text-slate-800">
              {formMode === 'create' ? 'Create Donation Campaign' : `Edit Campaign Settings`}
            </h3>
            <button
              onClick={() => setFormMode('list')}
              className="text-xs font-bold text-gray-400 hover:text-slate-600 transition"
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
                  placeholder="e.g. Save indie mothers"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Slug URL (lowercase-hyphened) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. save-indie-mothers"
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Financial Goal Amount *</label>
                <input
                  type="number"
                  required
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none font-mono text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Currency *</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none text-slate-700 font-bold"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Starts From</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-mono">Deactivates On</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1 block">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Campaign Pitch Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Pitch the fundraising target to potential digital donors..."
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-indigo-405 leading-relaxed text-slate-800"
              />
            </div>

            <div className="space-y-1 block">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Cover Banner Image</label>
              <FileUpload
                bucket="campaign-covers"
                path="covers"
                currentUrl={imageUrl || undefined}
                onUploadComplete={(result) => {
                  if (result) setImageUrl(result.public_url);
                  else setImageUrl('');
                }}
                onError={(err) => showToast(err, 'error')}
              />
            </div>

            <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-primary h-4 w-4 shrink-0"
              />
              <span className="text-xs font-bold text-slate-750">Publish Live immediately</span>
            </label>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow-md"
            >
              <Save size={14} className="inline mr-1" /> Save Campaign Layout
            </button>
          </form>
        </div>
      ) : (
        /* CAMPAIGN LIST CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-xs font-semibold text-gray-400 font-mono">Loading campaign registries...</div>
          ) : campaigns && campaigns.length > 0 ? (
            campaigns.map((c) => {
              const raised = c.raised_amount || 0;
              const goal = c.goal_amount || 1;
              const percentage = Math.min(100, Math.floor((raised / goal) * 100));

              return (
                <div id={`campaign-card-${c.id}`} key={c.id} className="bg-white rounded-3xl border border-orange-50 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="relative aspect-video bg-slate-100">
                    <img 
                      src={c.image_url || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400'} 
                      alt={c.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm ${
                        c.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {c.is_active ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left font-sans text-xs">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1 font-baloo">{c.title}</h4>
                      <p className="text-gray-450 line-clamp-2 leading-relaxed text-[11px] font-medium">{c.description || 'No detailed campaign pitch description shared yet.'}</p>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center font-mono text-[10px] text-gray-550 font-bold">
                        <span className="flex items-center gap-1 text-emerald-650">
                          <Percent size={10} /> {percentage}% Raised
                        </span>
                        <span className="flex items-center gap-1 text-indigo-600">
                          <Target size={10} /> ₹{raised.toLocaleString()} / ₹{goal.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="flex gap-2 pt-2 border-t">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border border-slate-205 transition cursor-pointer"
                      >
                        <Edit2 size={12} /> Edit Pitch
                      </button>

                      <button
                        onClick={() => handleToggleActive(c.id, c.is_active)}
                        className={`flex-1 font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                          c.is_active 
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-705 border-amber-150' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-705 border-emerald-150'
                        }`}
                      >
                        {c.is_active ? (
                          <>Archive</>
                        ) : (
                          <>Activate</>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 font-medium select-none bg-white border rounded-3xl">No crowdfunding campaigns defined in directory.</div>
          )}
        </div>
      )}
    </div>
  );
}
