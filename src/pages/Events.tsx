
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Check, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppContext';
import { useEvents, useEventMutations } from '@/lib/hooks/useEvents';

const LOCAL_INITIAL_EVENTS = [
  {
    id: 'evt-1',
    title: 'Bandra Weekend Adoption Popup',
    type: 'Adoption Camp',
    date: 'June 6, 2026',
    time: '4:00 PM - 8:00 PM',
    venue: 'Carter Road Amphitheatre, Mumbai',
    description: 'Meet 15+ available street puppies and rescue dogs up for adoption! Interactive behavior counseling on-site.',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600',
    mapsUrl: 'https://maps.google.com'
  },
  {
    id: 'evt-2',
    title: 'Indiranagar Rabies Vaccine Drive',
    type: 'Vaccine Camp',
    date: 'June 14, 2026',
    time: '9:00 AM - 1:00 PM',
    venue: 'BBMP Ground, Bengaluru',
    description: 'Free multi-component rabies vaccine shoots for community stray dogs. Free collar distributions for early retrievers.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    mapsUrl: 'https://maps.google.com'
  }
];

export default function EventsPage() {
  const { t } = useTranslation();
  const { triggerAppletActionLoader } = useAppContext();
  const { events: dbEvents, isLoading, error } = useEvents();
  const { registerForEvent } = useEventMutations();

  const eventsList = dbEvents && dbEvents.length > 0 ? dbEvents : LOCAL_INITIAL_EVENTS;

  const [eventRSVP, setEventRSVP] = useState<Record<string, boolean>>({});
  const [eventRSVPName, setEventRSVPName] = useState('');
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState<any | null>(null);

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventRSVPName || !selectedEventForRSVP) return;
    triggerAppletActionLoader("Securing RSVP invitation...", "Generating WhatsApp reminder code...", async () => {
      try {
        await registerForEvent(selectedEventForRSVP.id, {
          name: eventRSVPName,
          email: `${eventRSVPName.replace(/\s+/g, '').toLowerCase()}@example.com`,
          phone: '9876543210',
          attendee_count: 1
        });
        setEventRSVP(prev => ({ ...prev, [selectedEventForRSVP.id]: true }));
        setSelectedEventForRSVP(null);
        setEventRSVPName('');
      } catch (err: any) {
        console.error("RSVP error:", err);
        alert(`RSVP failed: ${err.message || 'Verification rejected'}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div id="athiaa-events-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">Canine Popups & Vaccine Camps</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Upcoming Athiaa Events</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          Interact, volunteer, or adopt! We organize weekend adoption camps and rabies drives inside major public parks in India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {eventsList.map((evt) => (
          <div key={evt.id} className="bg-white rounded-3xl overflow-hidden border border-orange-50 shadow-warm flex flex-col justify-between">
            <div className="relative aspect-video">
              <img src={(evt as any).image || (evt as any).image_url || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600'} alt={evt.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <span className="absolute top-4 left-4 bg-white px-3 py-1 text-[10px] font-bold text-primary rounded-full border border-orange-50 font-mono">{evt.type}</span>
            </div>

            <div className="p-6 space-y-4 text-left">
              <h3 className="text-xl font-bold font-baloo text-deep block">{evt.title}</h3>
              
              <div className="space-y-2 text-xs text-gray-500 font-sans">
                <p className="flex items-center"><Calendar size={13} className="text-primary mr-2 shrink-0" /> {evt.date}</p>
                <p className="flex items-center"><Clock size={13} className="text-primary mr-2 shrink-0" /> {evt.time || 'All Day'}</p>
                <p className="flex items-center"><MapPin size={13} className="text-primary mr-2 shrink-0" /> {evt.venue || evt.location}</p>
              </div>

              <p className="text-gray-500 text-[11px] leading-relaxed font-sans">{evt.description}</p>

              <div className="pt-4 border-t border-gray-150 flex items-center justify-between text-xs">
                {eventRSVP[evt.id] ? (
                  <span className="text-accent font-bold text-xs bg-green-50 border border-green-200 px-3 py-1 rounded-lg flex items-center space-x-1">
                    <Check size={12} />
                    <span>RSVP SECURED</span>
                  </span>
                ) : (
                  <button 
                    onClick={() => setSelectedEventForRSVP(evt)}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Secure RSVP Invitation
                  </button>
                )}
                <a href={(evt as any).mapsUrl || 'https://maps.google.com'} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-primary flex items-center font-semibold cursor-pointer space-x-0.5">
                  <span>Map coordinates</span>
                  <ChevronRight size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RSVP modal trigger popup */}
      {selectedEventForRSVP && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRSVPSubmit} className="bg-white rounded-3xl p-6 w-full max-w-xs space-y-4 text-left font-sans animate-[zoomIn_0.2s_ease-out]">
            <h4 className="font-baloo text-lg font-bold text-deep">Confirm RSVP Seat</h4>
            <p className="text-xs text-gray-500">Registering for: <span className="font-bold text-primary">{selectedEventForRSVP.title}</span></p>
            
            <input 
              type="text" 
              required
              placeholder="Enter Your Name"
              value={eventRSVPName}
              onChange={e => setEventRSVPName(e.target.value)}
              className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 text-xs text-deep focus:outline-none focus:border-primary font-semibold"
            />

            <button type="submit" className="w-full bg-accent hover:bg-green-705 text-white font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer">Register RSVP</button>
            <button type="button" onClick={() => setSelectedEventForRSVP(null)} className="w-full text-center text-xs text-gray-400 hover:underline cursor-pointer">Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}
