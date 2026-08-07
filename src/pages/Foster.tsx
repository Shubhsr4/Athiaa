
import React, { useState } from 'react';
import { Check, Heart } from 'lucide-react';
import { apiFetch } from '@/lib/api/clientApi';
import { Dog } from '@/src/types';
import { useAppContext } from '@/components/providers/AppContext';
import { useDogs } from '@/lib/hooks/useDogs';

const LOCAL_INITIAL_DOGS = [
  {
    id: 'dog-1',
    name: 'Kaju',
    breed: 'INDog',
    age: 'Puppy',
    size: 'Small',
    gender: 'Male',
    energyLevel: 'High',
    goodWithKids: true,
    goodWithOtherPets: true,
    city: 'Bengaluru',
    specialNeeds: false,
    personalityTags: ['Playful', 'Cuddle Bug'],
    medicalBadges: { vaccinated: true, neutered: false, dewormed: true, microchipped: true },
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    weight: '8 kg',
    rescueStory: 'Found huddled under a tea stall in Koramangala during heavy rains.'
  },
  {
    id: 'dog-2',
    name: 'Rani',
    breed: 'INDog',
    age: 'Adult',
    size: 'Medium',
    gender: 'Female',
    energyLevel: 'Medium',
    goodWithKids: true,
    goodWithOtherPets: true,
    city: 'Mumbai',
    specialNeeds: false,
    personalityTags: ['Calm', 'Loyal'],
    medicalBadges: { vaccinated: true, neutered: true, dewormed: true, microchipped: true },
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    weight: '16 kg',
    rescueStory: 'Rescued from a busy highway in Thane with a fractured leg.'
  }
];

export default function FosterPage() {
  const { triggerAppletActionLoader, setFosterRecords } = useAppContext();

  const handleTrackFoster = (record: any) => {
    setFosterRecords((prev: any[]) => [record, ...(prev || [])]);
  };

  const { dogs: dbDogs, isLoading, error } = useDogs({ status: 'available' });

  const dogsList = (dbDogs && dbDogs.length > 0 ? dbDogs : LOCAL_INITIAL_DOGS).map((d: any) => ({
    ...d,
    image: d.image || d.main_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    city: d.city || d.location || 'Delhi Shelter',
    personalityTags: (d.personalityTags && d.personalityTags.length > 0) ? d.personalityTags : (d.flags && d.flags.length > 0 ? d.flags : ['Friendly', 'Vaccinated']),
    lifeStory: d.lifeStory || d.description || 'Rescued street dog in need of loving care.',
    medicalBadges: d.medicalBadges || { vaccinated: true, neutered: true, dewormed: true, microchipped: true },
  }));

  // Foster faq active index
  const [fosterFaqActiveIndex, setFosterFaqActiveIndex] = useState<number | null>(null);
  const [selectedFosterDog, setSelectedFosterDog] = useState<any>(null);
  const [fosterForm, setFosterForm] = useState({ name: '', phone: '', city: 'Mumbai', duration: '2 weeks', experience: '' });
  const [fosterApplied, setFosterApplied] = useState(false);

  // Submit Foster Form
  const handleFosterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fosterForm.name || !fosterForm.phone || fosterForm.phone.length !== 10) {
      alert("Please check your contact fields and make sure phone number is 10 digits.");
      return;
    }

    const targetDog = selectedFosterDog || dogsList[0] || LOCAL_INITIAL_DOGS[0];

    triggerAppletActionLoader("Verifying foster guidelines...", "Submitting details to shelter dispatcher...", async () => {
      try {
        const res = await apiFetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'foster',
            name: fosterForm.name,
            email: `${fosterForm.phone}@aathia.org`,
            phone: fosterForm.phone,
            subject: `Foster Interest: ${targetDog?.name || 'Any Dog'}`,
            message: `Foster Duration: ${fosterForm.duration}. Active City: ${fosterForm.city}.`
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Server error');
        }

        handleTrackFoster({
          id: `fst-${Date.now()}`,
          dogId: targetDog?.id || 'any',
          dogName: targetDog?.name || 'Any Dog',
          dogImage: (targetDog as any)?.image || (targetDog as any)?.main_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
          duration: fosterForm.duration,
          submittedAt: new Date().toLocaleDateString('en-IN')
        });
        setFosterApplied(true);
      } catch (err: any) {
        console.error("Foster submit error:", err);
        alert(`Error submitting foster interest: ${err.message || 'Unable to submit'}`);
      }
    });
  };

  return (
    <div id="aathia-foster-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">Temporary Love, Big Relief</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Fostering Program Shelter</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          "Fostering ≠ Adopting." Give high-quality rest, medicine, and warm household environments to newly injured or recuperating street dogs for 2–4 weeks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start font-sans">
        <div className="lg:col-span-7 space-y-8">
          
          {/* Concept chart cards */}
          <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-accent font-bold text-lg">What Fostering Means</p>
              <p className="text-xs text-gray-650 leading-relaxed font-sans">
                You opening your gate to look after a pup for a short time while Aathia screens permanent adopters. This is incredibly helpful for terrified, shy dogs to learn that humans are safe.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-primary font-bold text-lg">Aathia Provisioning</p>
              <p className="text-xs text-gray-650 leading-relaxed">
                We supply 100% of the food, steel bowls, leashes, and vaccine medicine. Your local vet hub consultations are also paid entirely by Aathia. You only provide warmth!
              </p>
            </div>
          </div>

          {/* Foster FAQs collapses accordion */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-baloo text-deep">Fostering FAQs</h3>
            {[
              { q: "What is the average fostering timeframe?", a: "Most foster placements last between 10 days to 4 weeks, depending on the orthopedic recovery speed or adoption camp calendar." },
              { q: "Can renters foster street puppies?", a: "Absolutely. As long as you secure general family consensus and your landlord has no issues with canine visits." },
              { q: "Can I adopt the dog if I fall in love?", a: "Yes, this is affectionately known as 'Foster Failing'! You secure first priority if you apply for legal adoption." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-orange-50 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setFosterFaqActiveIndex(fosterFaqActiveIndex === idx ? null : idx)}
                  className="w-full text-left p-4 font-bold font-baloo text-sm md:text-base text-deep flex justify-between items-center cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-primary">{fosterFaqActiveIndex === idx ? '−' : '+'}</span>
                </button>
                {fosterFaqActiveIndex === idx && (
                  <p className="p-4 bg-orange-150/30 text-xs text-gray-600 border-t border-orange-50/50 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Application Signups sidebar */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-orange-50 shadow-warm">
          <h3 className="text-lg font-bold font-baloo text-deep border-b border-orange-50 pb-2 flex items-center">
            <span>Register as a Guardian Foster</span>
          </h3>

          {fosterApplied ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check size={24} />
              </div>
              <h4 className="font-baloo text-xl font-bold text-deep">Foster Application Tracked</h4>
              <p className="text-xs text-gray-500 leading-normal font-sans">
                Thank you! Your foster preference is mapped inside your User Dashboard. A local rescue coordinator will reach out over WhatsApp shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFosterSubmit} className="space-y-4 pt-4 text-xs font-sans text-left">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Furry Friend Needing Foster</label>
                <select 
                  onChange={e => setSelectedFosterDog(dogsList.find((d: any) => d.id === e.target.value) || dogsList[0])}
                  className="w-full bg-cream border border-orange-50 p-2.5 rounded-xl text-xs outline-none text-deep font-semibold"
                >
                  {dogsList.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.city} - {d.age})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Your Full Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={fosterForm.name}
                  onChange={e => setFosterForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1 font-sans">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Your WhatsApp Mobile (10-digits) *</label>
                <input 
                  type="tel" 
                  maxLength={10}
                  required
                  placeholder="Enter 10-digit Phone" 
                  value={fosterForm.phone}
                  onChange={e => setFosterForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Active City</label>
                  <select 
                    value={fosterForm.city}
                    onChange={e => setFosterForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 text-xs outline-none focus:border-primary"
                  >
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Delhi NCR</option>
                    <option>Pune</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Maximum Duration</label>
                  <select 
                    value={fosterForm.duration}
                    onChange={e => setFosterForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 text-xs outline-none focus:border-primary"
                  >
                    <option>1 Week</option>
                    <option>2 Weeks</option>
                    <option>1 Month</option>
                    <option>3 Months Special Case</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl uppercase tracking-wider font-baloo cursor-pointer"
              >
                Submit Foster Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
