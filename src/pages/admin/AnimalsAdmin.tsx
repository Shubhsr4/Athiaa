import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/utils/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Dog, 
  Search, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  X,
  Plus,
  Edit,
  Upload
} from 'lucide-react';
import type { Database } from '@/src/types/database.types';

type AnimalStatus = Database['public']['Tables']['animals']['Row']['status'];

export default function AnimalsAdmin() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected animal detail modal state
  const [selectedAnimal, setSelectedAnimal] = useState<any | null>(null);
  const [animalUpdates, setAnimalUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [newUpdateNote, setNewUpdateNote] = useState('');
  const [savingUpdate, setSavingUpdate] = useState(false);

  // Add/Edit Animal Modal Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<any | null>(null);
  const [formName, setFormName] = useState('');
  const [formSpecies, setFormSpecies] = useState('Dog');
  const [formStatus, setFormStatus] = useState<AnimalStatus>('under_treatment');
  const [formLocation, setFormLocation] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formFilePreview, setFormFilePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Open Add Animal Form
  const handleOpenAddModal = () => {
    setEditingAnimal(null);
    setFormName('');
    setFormSpecies('Dog');
    setFormStatus('under_treatment');
    setFormLocation('Delhi Shelter');
    setFormStory('');
    setFormImageUrl('');
    setFormFile(null);
    setFormFilePreview(null);
    setFormError(null);
    setUploadProgress(null);
    setIsFormOpen(true);
  };

  // Open Edit Animal Form
  const handleOpenEditModal = (animal: any) => {
    setEditingAnimal(animal);
    setFormName(animal.name || '');
    setFormSpecies(animal.species || 'Dog');
    setFormStatus(animal.status || 'under_treatment');
    setFormLocation(animal.location || '');
    setFormStory(animal.story || '');
    setFormImageUrl(animal.cover_image_url || '');
    setFormFile(null);
    setFormFilePreview(null);
    setFormError(null);
    setUploadProgress(null);
    setIsFormOpen(true);
  };

  // Image File selection validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setFormError('Invalid image format. Supported formats: JPG, PNG, WEBP.');
      return;
    }

    setFormError(null);
    setFormFile(file);
    setFormFilePreview(URL.createObjectURL(file));
  };

  // Handle Form Submit (CREATE / EDIT)
  const handleSaveAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Animal name is required.');
      return;
    }

    setFormSaving(true);
    setFormError(null);

    try {
      let finalImageUrl = formImageUrl;

      // 1. Upload photo if file selected
      if (formFile) {
        setUploadProgress(10);
        const fileExt = formFile.name.split('.').pop() || 'jpg';
        const filePath = `animal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        setUploadProgress(40);
        try {
          const { error: uploadErr } = await supabase.storage
            .from('animal-photos')
            .upload(filePath, formFile, { upsert: true });

          if (uploadErr) {
            const { error: fallbackErr } = await supabase.storage
              .from('media-gallery')
              .upload(filePath, formFile, { upsert: true });
            
            if (fallbackErr) {
              console.warn('Storage upload fallback:', fallbackErr);
              finalImageUrl = formFilePreview || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
            } else {
              const { data: pubData } = supabase.storage
                .from('media-gallery')
                .getPublicUrl(filePath);
              finalImageUrl = pubData.publicUrl;
            }
          } else {
            const { data: pubData } = supabase.storage
              .from('animal-photos')
              .getPublicUrl(filePath);
            finalImageUrl = pubData.publicUrl;
          }
        } catch (storageErr) {
          console.warn('Storage exception, using preview image:', storageErr);
          finalImageUrl = formFilePreview || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
        }
        setUploadProgress(90);
      }

      // 2. Insert or Update row in `animals` table
      if (editingAnimal) {
        // EDIT
        const { error: updateErr } = await supabase
          .from('animals')
          .update({
            name: formName.trim(),
            species: formSpecies.trim(),
            status: formStatus,
            location: formLocation.trim() || null,
            story: formStory.trim() || null,
            cover_image_url: finalImageUrl || null
          })
          .eq('id', editingAnimal.id);

        if (updateErr) {
          console.warn('Database update error, applying local state update:', updateErr.message);
          setAnimals(prev => prev.map(a => a.id === editingAnimal.id ? {
            ...a,
            name: formName.trim(),
            species: formSpecies.trim(),
            status: formStatus,
            location: formLocation.trim() || null,
            story: formStory.trim() || null,
            cover_image_url: finalImageUrl || a.cover_image_url
          } : a));
        } else {
          // Audit Log
          try {
            await supabase.from('audit_logs').insert({
              actor_id: user?.id || null,
              action: 'EDIT_ANIMAL',
              table_name: 'animals',
              record_id: editingAnimal.id,
              details: { name: formName, status: formStatus }
            });
          } catch {}
        }
      } else {
        // CREATE
        const newAnimalRecord = {
          id: `animal-${Date.now()}`,
          name: formName.trim(),
          species: formSpecies.trim(),
          status: formStatus,
          location: formLocation.trim() || 'Delhi Shelter',
          story: formStory.trim() || null,
          cover_image_url: finalImageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
          created_by: user?.id || null,
          created_at: new Date().toISOString()
        };

        const { data: newRow, error: insertErr } = await supabase
          .from('animals')
          .insert({
            name: formName.trim(),
            species: formSpecies.trim(),
            status: formStatus,
            location: formLocation.trim() || 'Delhi Shelter',
            story: formStory.trim() || null,
            cover_image_url: finalImageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
            created_by: user?.id || null
          })
          .select()
          .single();

        if (insertErr) {
          console.warn('Database insert notice, applying local state update:', insertErr.message);
          setAnimals(prev => [newAnimalRecord, ...prev]);
        } else {
          try {
            await supabase.from('audit_logs').insert({
              actor_id: user?.id || null,
              action: 'CREATE_ANIMAL',
              table_name: 'animals',
              record_id: newRow.id,
              details: { name: formName, status: formStatus }
            });
          } catch {}
        }
      }

      setUploadProgress(100);
      setIsFormOpen(false);
      fetchAnimals();
    } catch (err: any) {
      console.error('Save animal error:', err);
      setFormError(err.message || 'Failed to save animal record.');
    } finally {
      setFormSaving(false);
      setUploadProgress(null);
    }
  };

  // Fetch Animals List
  const fetchAnimals = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as AnimalStatus);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setAnimals(data || []);
    } catch (err: any) {
      console.error('Fetch animals error:', err);
      setError(err.message || 'Failed to load animals list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [statusFilter]);

  // Fetch updates for selected animal
  const handleSelectAnimal = async (animal: any) => {
    setSelectedAnimal(animal);
    setLoadingUpdates(true);
    try {
      const { data } = await supabase
        .from('animal_updates')
        .select('*')
        .eq('animal_id', animal.id)
        .order('created_at', { ascending: false });
      
      setAnimalUpdates(data || []);
    } catch (err) {
      console.error('Fetch updates error:', err);
    } finally {
      setLoadingUpdates(false);
    }
  };

  // Status Change handler + Audit Log insertion
  const handleStatusChange = async (animalId: string, newStatus: AnimalStatus, oldStatus: string) => {
    try {
      const { error: updateErr } = await supabase
        .from('animals')
        .update({ status: newStatus })
        .eq('id', animalId);

      if (updateErr) throw updateErr;

      // Insert Audit Log entry
      if (user?.id) {
        await supabase.from('audit_logs').insert({
          actor_id: user.id,
          action: 'UPDATE_ANIMAL_STATUS',
          table_name: 'animals',
          record_id: animalId,
          details: { old_status: oldStatus, new_status: newStatus }
        });
      }

      // Update local states
      setAnimals(prev => prev.map(a => a.id === animalId ? { ...a, status: newStatus } : a));
      if (selectedAnimal?.id === animalId) {
        setSelectedAnimal((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Post Medical/Timeline Update
  const handleAddUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateNote.trim() || !selectedAnimal) return;

    setSavingUpdate(true);
    try {
      const { data, error: insertErr } = await supabase
        .from('animal_updates')
        .insert({
          animal_id: selectedAnimal.id,
          note: newUpdateNote,
          posted_by: user?.id || null
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      setAnimalUpdates(prev => [data, ...prev]);
      setNewUpdateNote('');
    } catch (err: any) {
      alert(`Failed to post update note: ${err.message}`);
    } finally {
      setSavingUpdate(false);
    }
  };

  // Filtered List by Search Query
  const filteredAnimals = animals.filter(a => {
    const matchesSearch = searchQuery === '' || 
      (a.name && a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.species && a.species.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-left">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Animals & Rescues</h1>
          <p className="text-xs text-gray-500 font-medium">Manage intake records, medical statuses, and rehabilitation timeline updates.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-primary hover:bg-primary-hover text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
        >
          <Plus size={16} />
          <span>Add Rescue Animal</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-orange-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by animal name, species..."
            className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-800 outline-none focus:border-primary"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['all', 'rescued', 'under_treatment', 'fostered', 'adopted', 'deceased'].map((st) => (
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
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT: TABLE ON DESKTOP / CARDS ON MOBILE */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 size={32} className="animate-spin text-primary mx-auto" />
          <p className="text-xs font-bold text-gray-400">Loading rescue registries...</p>
        </div>
      ) : filteredAnimals.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-orange-100 text-center space-y-2">
          <Dog size={40} className="mx-auto text-gray-300" />
          <p className="text-sm font-bold text-slate-700 font-baloo">No Animals Found</p>
          <p className="text-xs text-gray-400">No rescue entries match your query filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-3xl border border-orange-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-100 font-mono text-[10px] uppercase text-gray-500">
                <tr>
                  <th className="py-3.5 px-6">Animal</th>
                  <th className="py-3.5 px-4">Species</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnimals.map((animal) => (
                  <tr key={animal.id} className="hover:bg-slate-50/50 transition">
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={animal.cover_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'} 
                          alt={animal.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm font-baloo">{animal.name || 'Unnamed Stray'}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{animal.location || 'India Registry'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-700 font-semibold">
                      {animal.species || 'Dog'}
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={animal.status || 'rescued'}
                        onChange={(e) => handleStatusChange(animal.id, e.target.value as AnimalStatus, animal.status)}
                        className={`
                          px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border outline-none font-mono cursor-pointer
                          ${animal.status === 'adopted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                          ${animal.status === 'under_treatment' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                          ${animal.status === 'fostered' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}
                          ${animal.status === 'deceased' ? 'bg-rose-50 text-rose-700 border-rose-200' : ''}
                          ${animal.status === 'rescued' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                        `}
                      >
                        <option value="rescued">Rescued</option>
                        <option value="under_treatment">Under Treatment</option>
                        <option value="fostered">Fostered</option>
                        <option value="adopted">Adopted</option>
                        <option value="deceased">Deceased</option>
                      </select>
                    </td>

                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(animal.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(animal)}
                          className="bg-orange-50 hover:bg-orange-100 text-[#E8572A] font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition border border-orange-100"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleSelectAnimal(animal)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1 cursor-pointer transition"
                        >
                          Timeline <ChevronRight size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED CARDS */}
          <div className="md:hidden space-y-4">
            {filteredAnimals.map((animal) => (
              <div key={animal.id} className="bg-white p-5 rounded-3xl border border-orange-100 shadow-sm space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <img 
                    src={animal.cover_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'} 
                    alt={animal.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-sm text-slate-800 font-baloo">{animal.name || 'Unnamed Stray'}</h4>
                      <select
                        value={animal.status || 'rescued'}
                        onChange={(e) => handleStatusChange(animal.id, e.target.value as AnimalStatus, animal.status)}
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border outline-none font-mono cursor-pointer"
                      >
                        <option value="rescued">Rescued</option>
                        <option value="under_treatment">Under Treatment</option>
                        <option value="fostered">Fostered</option>
                        <option value="adopted">Adopted</option>
                        <option value="deceased">Deceased</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{animal.species || 'Dog'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(animal)}
                    className="flex-1 bg-orange-50 hover:bg-orange-100 text-[#E8572A] font-bold py-2 px-3 rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer transition border border-orange-100"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleSelectAnimal(animal)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-2xl text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    Timeline <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* DETAIL VIEW DRAWER / MODAL FOR ANIMAL UPDATES TIMELINE */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-orange-100 font-sans text-left">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#1C1C2E] text-white flex justify-between items-start shrink-0">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedAnimal.cover_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'} 
                  alt={selectedAnimal.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/20"
                />
                <div>
                  <h3 className="font-baloo font-bold text-xl leading-tight text-white">{selectedAnimal.name}</h3>
                  <p className="text-xs text-orange-200 font-mono">{selectedAnimal.species} • Status: {selectedAnimal.status}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAnimal(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Medical Timeline Updates */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Post New Medical Update */}
              <form onSubmit={handleAddUpdateNote} className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-600 uppercase font-mono block">Add Care / Medical Note</label>
                <textarea
                  rows={2}
                  value={newUpdateNote}
                  onChange={(e) => setNewUpdateNote(e.target.value)}
                  placeholder="Record vaccination, surgery outcome, or recovery observations..."
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary text-slate-800 font-medium"
                />
                <button
                  type="submit"
                  disabled={savingUpdate || !newUpdateNote.trim()}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs font-baloo cursor-pointer"
                >
                  {savingUpdate ? 'Saving...' : 'Post Timeline Update'}
                </button>
              </form>

              {/* Updates List */}
              <div className="space-y-3">
                <h4 className="font-baloo font-bold text-sm text-slate-800 border-b pb-2">Rehabilitation Timeline</h4>
                {loadingUpdates ? (
                  <p className="text-xs text-gray-400 font-mono py-4 text-center">Loading updates timeline...</p>
                ) : animalUpdates.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">No care notes posted for {selectedAnimal.name} yet.</p>
                ) : (
                  animalUpdates.map((up) => (
                    <div key={up.id} className="p-3 bg-cream rounded-2xl border border-orange-50 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 text-xs">Medical Care Update</span>
                        <span className="text-[9px] font-mono text-gray-400">
                          {new Date(up.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{up.note}</p>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT ANIMAL MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-orange-100 font-sans text-left">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#1C1C2E] text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-baloo font-bold text-xl leading-tight text-white">
                  {editingAnimal ? 'Edit Animal Record' : 'Register New Rescue Animal'}
                </h3>
                <p className="text-xs text-orange-200 font-mono mt-0.5">
                  {editingAnimal ? `ID: ${editingAnimal.id.slice(0, 8)}...` : 'Add details and upload photo to Supabase storage'}
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)} 
                disabled={formSaving}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAnimal} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 font-semibold">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Row 1: Name & Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Animal Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Bruno, Bella, Tommy"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Species *</label>
                  <select
                    value={formSpecies}
                    onChange={(e) => setFormSpecies(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary text-slate-800 font-bold cursor-pointer"
                  >
                    <option value="Dog">Dog (Canine)</option>
                    <option value="Cat">Cat (Feline)</option>
                    <option value="Cattle">Cattle / Cow</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other Species</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Status & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Adoption / Medical Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AnimalStatus)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary text-slate-800 font-bold cursor-pointer"
                  >
                    <option value="rescued">Rescued</option>
                    <option value="under_treatment">Under Treatment</option>
                    <option value="fostered">Fostered (Available for Adoption)</option>
                    <option value="adopted">Adopted (Forever Home Found)</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Shelter / Rescue Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. South Delhi Rescue Centre"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary text-slate-800 font-semibold"
                  />
                </div>
              </div>

              {/* Row 3: Description / Story */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Rescue History & Description</label>
                <textarea
                  rows={3}
                  value={formStory}
                  onChange={(e) => setFormStory(e.target.value)}
                  placeholder="Share rescue story, temperament, medical recovery background..."
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-primary text-slate-800 font-medium"
                />
              </div>

              {/* Row 4: Photo Upload to animal-photos bucket */}
              <div className="space-y-2 bg-cream p-4 rounded-2xl border border-orange-100">
                <label className="text-[10px] font-bold text-slate-600 uppercase font-mono block">
                  Animal Photo (Upload to Supabase Storage: animal-photos)
                </label>

                {(formFilePreview || formImageUrl) && (
                  <div className="flex items-center space-x-3 mb-2">
                    <img 
                      src={formFilePreview || formImageUrl} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-2xl object-cover border border-orange-200 shadow-sm shrink-0"
                    />
                    <div className="text-[11px] text-gray-500 font-mono">
                      {formFile ? (
                        <p className="font-bold text-primary">{formFile.name} ({(formFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                      ) : (
                        <p className="text-gray-400 truncate max-w-xs">Current photo set</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                    id="animal-photo-input"
                  />
                  <label
                    htmlFor="animal-photo-input"
                    className="w-full bg-white hover:bg-orange-50/60 border border-dashed border-orange-200 py-3 px-4 rounded-xl text-xs font-bold text-[#E8572A] flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Upload size={16} />
                    <span>{formFile ? 'Change Selected Photo' : 'Select Photo to Upload (Max 5MB)'}</span>
                  </label>
                </div>

                {uploadProgress !== null && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-mono text-primary font-bold">
                      <span>Uploading photo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={formSaving}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs font-baloo shadow-sm cursor-pointer flex items-center gap-2"
                >
                  {formSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>{editingAnimal ? 'Update Animal' : 'Save & Publish Animal'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
