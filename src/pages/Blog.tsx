
import React, { useState } from 'react';
import { Search, Tag, ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useBlogPosts } from '@/lib/hooks/useBlog';

const LOCAL_INITIAL_BLOG_POSTS = [
  {
    id: 'post-1',
    title: 'Stray Dog Protection Laws & Constitution of India',
    category: 'Stray Legislation',
    tags: ['laws', 'protection', 'rights'],
    summary: 'Understand Animal Welfare Board guidelines, IPC Section 428/429 rights, and legal actions protecting stray dog feeders.',
    content: 'Feeding stray dogs is protected under Article 51A(g) of the Indian Constitution which mandates compassion for all living creatures. As a citizen, you possess legal protection to perform street feed drives without harassment. Landmark verdicts by honorable High Courts have reiterated that housing societies cannot ban stray feeding.',
    author: 'Advocate Sneha Deshmukh',
    date: 'May 10, 2026',
    readTime: '6 mins read',
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'post-2',
    title: 'Immunity Diet Charts & Healthy Nutrient Ratios',
    category: 'Nutrition Guide',
    tags: ['diet', 'nutrition', 'stray-care'],
    summary: 'A simple vet-approved breakdown of calcium, carbohydrates, and rice ingredients to cook in bulk for community puppies.',
    content: 'Nourishing a street pack does not require expensive commercial canned logs. You can cook healthy mixtures of boiled white rice, yellow pumpkin pieces, and boiled eggs or double-cleaned minced chicken bits. Ensure zero salt, zero onions, and zero toxic masalas to keep the pack immune system strong during peak monsoons.',
    author: 'Dr. Rohan Mehra (DVM)',
    date: 'May 18, 2026',
    readTime: '4 mins read',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600'
  }
];

export default function BlogPage() {
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedBlogArticle, setSelectedBlogArticle] = useState<any | null>(null);

  const { posts: dbPosts, isLoading, error } = useBlogPosts();

  const postsList = dbPosts && dbPosts.length > 0 ? dbPosts : LOCAL_INITIAL_BLOG_POSTS;

  const normalizedPosts = (postsList || []).map((b: any) => ({
    id: b.id,
    title: b.title,
    category: b.category,
    summary: b.summary,
    content: b.content,
    author: b.author || 'Athia Expert',
    date: b.published_at ? new Date(b.published_at).toLocaleDateString('en-IN') : (b.date || 'Recent'),
    readTime: b.read_time || b.readTime || '5 mins read',
    image: b.cover_image_url || b.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600',
    tags: b.tags || []
  }));

  // Derive unique tags cleanly
  const allTags = Array.from(
    new Set((normalizedPosts || []).flatMap((p: any) => p.tags || []))
  );

  // Filter posts based on selected tag & search query
  const filteredBlogs = (normalizedPosts || []).filter((b: any) => {
    const matchesSearch = !blogSearch || 
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
      b.summary.toLowerCase().includes(blogSearch.toLowerCase());
    
    const matchesTag = !selectedTag || (b.tags && b.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div id="athia-blog-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      {selectedBlogArticle ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedBlogArticle(null)}
            className="flex items-center space-x-1.5 text-xs text-primary font-bold hover:underline cursor-pointer bg-orange-50 px-4 py-2 rounded-xl"
          >
            <ArrowLeft size={14} />
            <span>Back to Educational Articles</span>
          </button>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-50 shadow-warm font-sans space-y-6 text-left">
            <div>
              <span className="text-primary font-bold font-mono text-[10px] tracking-wider block uppercase">{selectedBlogArticle.category}</span>
              <h1 className="text-2xl md:text-4xl font-bold font-baloo text-deep leading-tight mt-1">{selectedBlogArticle.title}</h1>
              <p className="text-[10px] text-gray-400 mt-2 font-mono">{selectedBlogArticle.author} • {selectedBlogArticle.date || 'Recent'} • {selectedBlogArticle.readTime || '5 mins read'}</p>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden max-h-96 w-full">
              <img src={selectedBlogArticle.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600'} alt={selectedBlogArticle.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="text-gray-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4 font-normal">
              {selectedBlogArticle.content}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 font-sans">
          
          <div className="text-center space-y-2">
            <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">Canine Welfare Guides</span>
            <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Stray Education Chronicles</h1>
            <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
              Learn about street dog protection rights, Article 51A(g) laws, stray diet charts, and immunization schedules written by vet advisors.
            </p>
          </div>

          {/* Search bar */}
          <div className="max-w-md mx-auto relative font-sans">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Query by title or keywords..."
              value={blogSearch}
              onChange={e => setBlogSearch(e.target.value)}
              className="w-full bg-cream border border-orange-50 rounded-xl py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-primary font-semibold text-deep"
            />
          </div>

          {/* Derived Tag filter chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1 border cursor-pointer ${
                  selectedTag === null 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-white text-gray-550 hover:bg-cream border-orange-50'
                }`}
              >
                <span>All Guides</span>
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1 border cursor-pointer ${
                    selectedTag === tag 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white text-gray-550 hover:bg-cream border-orange-50'
                  }`}
                >
                  <Tag size={10} />
                  <span>#{tag}</span>
                </button>
              ))}
            </div>
          )}

          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {filteredBlogs.map((b) => (
                <div key={b.id} className="bg-white rounded-3xl overflow-hidden border border-orange-50 shadow-sm flex flex-col justify-between group">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={b.image || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600'} alt={b.title} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" referrerPolicy="no-referrer" />
                  </div>

                  <div className="p-6 space-y-3">
                    <span className="text-[9px] text-[#2E8B57] bg-green-50 border border-green-200 font-extrabold px-2 py-0.5 rounded-full font-mono uppercase">{b.category}</span>
                    <h3 className="text-xl font-bold font-baloo text-deep block leading-snug">{b.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{b.summary}</p>
                    
                    <div className="pt-3 border-t border-gray-150 flex justify-between items-center text-[10px] text-primary font-bold font-mono">
                      <button onClick={() => setSelectedBlogArticle(b)} className="hover:underline cursor-pointer flex items-center space-x-1">
                        <span>Read Full Article Guide</span>
                        <ChevronRight size={12} />
                      </button>
                      <span className="text-gray-450">{b.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 max-w-sm mx-auto space-y-2">
              <BookOpen size={32} className="text-gray-300 mx-auto" />
              <h4 className="font-bold text-deep font-baloo">No Guides Found</h4>
              <p className="text-xs text-gray-500 font-sans leading-relaxed">Try resetting your filter tag chips or search with generic words like 'laws' or 'nutrition'.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
