
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDogs } from '@/lib/hooks/useDogs';
import { useDogMutations } from '@/lib/hooks/useDog';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Plus, Edit2, Trash2, Search, SlidersHorizontal, Sliders, Star } from 'lucide-react';

export default function DogManagementPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { deleteDog } = useDogMutations();
  const { toast, showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { dogs, isLoading: dogsLoading, mutate } = useDogs({
    status: statusFilter || undefined,
    search: debouncedSearch || undefined,
    per_page: 50
  });

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you absolutely sure you want to delete dog "${name}"? This action cannot be undone.`)) {
      try {
        await deleteDog(id);
        mutate();
        showToast(`Successfully deleted dog profiles for "${name}"`, 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to delete dog', 'error');
      }
    }
  };

  return (
    <div id="dog-management-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Link to="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-gray-600">Dogs</span>
          </div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Dog Fleet Management</h1>
        </div>
        <Link
          id="add-dog-top-btn"
          to="/admin/dogs/new"
          className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-5 rounded-2xl text-xs font-baloo tracking-wide flex items-center gap-2 shadow-sm shrink-0 w-fit cursor-pointer"
        >
          <Plus size={16} /> Add New Dog
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
          <input
            id="dog-search-input"
            type="text"
            placeholder="Search dogs by name, breed, description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-primary/50 text-xs py-3 pl-10 pr-4 rounded-xl font-medium text-slate-700"
          />
        </div>
        {/* Status selection */}
        <div className="min-w-[180px]">
          <select
            id="dog-status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none focus:border-primary/50 text-xs p-3 rounded-xl font-bold text-slate-705"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="adopted">Adopted</option>
            <option value="foster">Foster</option>
            <option value="medical_hold">Medical Hold</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>
      </div>

      {/* Main Listing Table */}
      <div className="bg-white border border-orange-50 rounded-3xl shadow-sm overflow-hidden">
        {dogsLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-400">Querying live dog registers...</div>
        ) : dogs && dogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="dogs-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6 text-center">Cover</th>
                  <th className="py-4 px-2">Name</th>
                  <th className="py-4 px-2">Breed</th>
                  <th className="py-4 px-2 text-center">Status</th>
                  <th className="py-4 px-2 text-center">Gender</th>
                  <th className="py-4 px-2 text-center">Featured</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600">
                {dogs.map((dog) => (
                  <tr id={`dog-row-${dog.id}`} key={dog.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-center">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 mx-auto border border-orange-50">
                        <img 
                          src={dog.main_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200'} 
                          alt={dog.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-800 text-sm">{dog.name}</td>
                    <td className="py-3 px-2 font-medium text-slate-500">{dog.breed}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        dog.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        dog.status === 'adopted' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        dog.status === 'foster' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        dog.status === 'medical_hold' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-205'
                      }`}>
                        {dog.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-slate-500 capitalize">{dog.gender}</td>
                    <td className="py-3 px-2 text-center">
                      {dog.flags?.includes('featured') ? (
                        <Star size={14} className="text-amber-500 fill-amber-400 mx-auto" />
                      ) : (
                        <span className="text-gray-350 text-xs font-semibold">-</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right space-x-1">
                      <Link
                        id={`edit-dog-${dog.id}`}
                        to={`/admin/dogs/${dog.id}/edit`}
                        className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl text-[11px] border border-slate-200 transition"
                      >
                        <Edit2 size={12} /> Edit
                      </Link>
                      <button
                        id={`delete-dog-${dog.id}`}
                        onClick={() => handleDelete(dog.id, dog.name)}
                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl text-[11px] border border-rose-150 transition cursor-pointer"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 font-medium select-none">No dogs currently match the filter options.</div>
        )}
      </div>
    </div>
  );
}
