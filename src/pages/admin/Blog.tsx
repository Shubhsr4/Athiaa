
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBlogPosts, useBlogMutations } from '@/lib/hooks/useBlog';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Plus, Edit2, Trash2, Calendar, FileText, CheckCircle2, CloudLightning } from 'lucide-react';

export default function BlogManagementPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast, showToast } = useToast();
  const { deletePost, updatePost } = useBlogMutations();

  const [tagFilter, setTagFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const { posts, isLoading, mutate } = useBlogPosts({
    tags: tagFilter || undefined,
    search: searchFilter || undefined
    // Show all matching posts
  });

  if (authLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you absolutely sure you want to delete blog article "${title}"?`)) {
      try {
        await deletePost(id);
        showToast('Article deleted successfully!', 'success');
        mutate();
      } catch (err: any) {
        showToast(err.message || 'Deletion failed', 'error');
      }
    }
  };

  const handleStatusToggle = async (id: string, current: string) => {
    const nextStatus = current === 'published' ? 'draft' : 'published';
    try {
      await updatePost(id, { status: nextStatus });
      showToast(`Article set to ${nextStatus}!`, 'success');
      mutate();
    } catch (err: any) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  return (
    <div id="blog-mgmt-root" className="max-w-7xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Link to="/admin" className="hover:text-primary">Admin</Link>
            <span>/</span>
            <span className="text-gray-600">Blog</span>
          </div>
          <h1 className="text-3xl font-extrabold font-baloo text-slate-800">Operational Log & Blogs</h1>
          <p className="text-xs text-gray-500">Edit news digests, stray rescue stories, and volunteer alerts.</p>
        </div>

        <Link
          id="create-new-blog-btn"
          to="/admin/blog/new/edit"
          className="bg-primary hover:bg-primary-hover text-white font-bold py-3 px-5 rounded-2xl text-xs font-baloo tracking-wide flex items-center gap-2 shadow-sm shrink-0 w-fit cursor-pointer"
        >
          <Plus size={16} /> Compose Article
        </Link>
      </div>

      {/* Local Filter inputs */}
      <div className="bg-white p-4 rounded-2xl border border-orange-50 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            id="blog-search-box"
            type="text"
            placeholder="Search articles by title or contents..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-205 outline-none focus:border-primary/50 text-xs py-3 px-4 rounded-xl font-medium text-slate-700"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <input
            id="blog-tag-box"
            type="text"
            placeholder="Filter by tag (e.g. rescue)"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-205 outline-none focus:border-primary/50 text-xs py-3 px-4 rounded-xl font-semibold text-slate-700"
          />
        </div>
      </div>

      {/* Blogs Listings Table */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden text-left">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-405 font-mono">Loading articles...</div>
        ) : posts && posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table id="blog-admin-table" className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-[10px] font-bold text-gray-400 uppercase font-mono">
                  <th className="py-4 px-6 text-center">Banner</th>
                  <th className="py-4 px-4">Title / Author</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4">Tags</th>
                  <th className="py-4 px-4 text-center">Date Sourced</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-650 font-medium">
                {posts.map((post) => (
                  <tr id={`post-row-${post.id}`} key={post.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6 text-center">
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 mx-auto border">
                        <img 
                          src={post.cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=200'} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-sm max-w-[280px]">
                      <p className="truncate font-baloo">{post.title}</p>
                      <p className="text-[10px] text-gray-400 font-semibold font-mono">
                        by {(post as any).author_name || 'Aathia Staff'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        id={`status-toggle-${post.id}`}
                        onClick={() => handleStatusToggle(post.id, post.status)}
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border cursor-pointer select-none transition ${
                          post.status === 'published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-150 hover:bg-emerald-100' 
                            : post.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-700 border-slate-150 hover:bg-slate-100'
                        }`}
                      >
                        {post.status}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {post.tags && post.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {post.tags.map((tg, i) => (
                            <span key={i} className="bg-slate-50 border px-1.5 py-0.5 rounded text-[9px] font-bold text-slate-500 lowercase">
                              #{tg}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-350">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-gray-400">
                      {post.published_at 
                        ? new Date(post.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'Unpublished Draft'
                      }
                    </td>
                    <td className="py-3 px-6 text-right space-x-1.5">
                      <Link
                        id={`edit-post-${post.id}`}
                        to={`/admin/blog/${post.id}/edit`}
                        className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-705 font-bold px-3 py-2 rounded-xl text-[11px] border border-slate-205 transition"
                      >
                        <Edit2 size={12} /> Edit
                      </Link>
                      <button
                        id={`delete-post-${post.id}`}
                        onClick={() => handleDelete(post.id, post.title)}
                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-705 font-bold px-3 py-2 rounded-xl text-[11px] border border-rose-150 transition cursor-pointer"
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
          <div className="p-16 text-center text-slate-400 font-medium select-none bg-white border rounded-3xl">No articles found matching filters.</div>
        )}
      </div>

    </div>
  );
}
