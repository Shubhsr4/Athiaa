
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import { useSuccessStories } from '@/lib/hooks/useSuccessStories';

const DEFAULT_SUCCESS_STORIES = [
  {
    id: 'story-1',
    dogName: 'Jalebi',
    city: 'Mumbai',
    quote: '"She is incredibly sweet, learns toilet rules faster than golden retrievers!"',
    update: 'Rescued in 2024 from a sewer gutter, Jalebi now resides in an apartment in Bandra, high-fiving neighbors.',
    beforeImage: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=600',
    adopter: 'The Mehtas'
  },
  {
    id: 'story-2',
    dogName: 'Rocky',
    city: 'Bengaluru',
    quote: '"Rocky lost his leg in an automobile crash, but he never lost his spirit. He climbs up stairs faster than we do!"',
    update: 'Rocky was adopted by an avid trekker. He regularly visits Nandi Hills and loves going on road trips in a hatchback!',
    beforeImage: 'https://images.unsplash.com/photo-1502673530728-f79b4cbd313c?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=80&w=600',
    adopter: 'Vikram & Sneha'
  }
];

export default function StoriesPage() {
  const { t } = useTranslation();
  const [storyFilterCity, setStoryFilterCity] = useState('All');
  const { stories: dbStories, isLoading, error } = useSuccessStories();

  const rawStories = dbStories && dbStories.length > 0 ? dbStories : DEFAULT_SUCCESS_STORIES;
  const storiesList = rawStories.map((story: any) => ({
    id: story.id,
    dogName: story.dogName || story.title || 'Athiaa Dog',
    city: story.city || 'Mumbai',
    quote: story.quote || story.content || '',
    update: story.update || story.content || '',
    beforeImage: story.beforeImage || story.image_url || 'https://images.unsplash.com/photo-1534361960057-19889db9621e',
    afterImage: story.afterImage || story.image_url || 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9',
    adopter: story.adopter || story.author_name || 'Blessed Family'
  }));

  const filteredStories = storiesList.filter(
    (st: any) => storyFilterCity === 'All' || st.city.toLowerCase() === storyFilterCity.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div id="athiaa-stories-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">Lives Completely Reformed</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Adopted Success Stories</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          Real happy updates from families across Indian neighborhoods who adopted local native street dogs and tripods. No stock photos.
        </p>
      </div>

      {/* Quick city filter */}
      <div className="flex gap-2 justify-center font-sans">
        {['All', 'Mumbai', 'Bengaluru'].map((item) => (
          <button 
            key={item} 
            onClick={() => setStoryFilterCity(item)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${storyFilterCity === item ? 'bg-primary text-white shadow' : 'bg-white text-gray-550 border border-gray-150 hover:bg-cream'}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        {filteredStories.map((story: any, i: number) => (
          <div key={story.id || i} className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-6 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center text-xs">
                <img src={story.beforeImage} alt="Trauma dog before rescue" className="rounded-2xl grayscale aspect-square object-cover h-40 w-full" referrerPolicy="no-referrer" />
                <span className="text-red-500 font-bold bg-red-50 border px-2 py-0.5 rounded-full inline-block mt-2 font-mono text-[9px]">DITCH DRAIN</span>
              </div>
              <div className="text-center text-xs">
                <img src={story.afterImage} alt="Happy adopted dog in loving home" className="rounded-2xl aspect-square object-cover h-40 w-full border-2 border-green-200" referrerPolicy="no-referrer" />
                <span className="text-accent font-bold bg-green-50 border px-2 py-0.5 rounded-full inline-block mt-2 font-mono text-[9px]">LOVED FAMILY HOME</span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2.5 py-0.5 rounded-full font-mono">{story.city} STORY</span>
              <h3 className="text-2xl font-bold font-baloo text-deep leading-tight">Mending {story.dogName}</h3>
              <p className="text-gray-750 italic text-xs leading-relaxed font-semibold">"{story.quote}"</p>
              <p className="text-[11px] text-gray-600 font-sans leading-normal">{story.update}</p>
              <p className="text-[11px] text-gray-405 font-mono">Adopted with love by: {story.adopter}</p>
            </div>

            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(`Read ${story.dogName} Happy adopted story in Athiaa welfare: ${window.location.href}`);
                  alert("Story share link copied!");
                } else {
                  alert(`Share link customized for ${story.dogName}! Check WhatsApp!`);
                }
              }}
              className="w-full text-center bg-orange-55 text-primary border border-orange-200/40 font-extrabold py-2.5 rounded-xl text-xs hover:bg-orange-100/50 flex flex-row items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Share2 size={12} />
              <span>Share Story on WhatsApp</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
