
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ShieldAlert, Stethoscope, Car, Camera, ShieldCheck, Check, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/components/providers/AppContext';
import { useMyVolunteerStatus, useVolunteerMutations } from '@/lib/hooks/useVolunteers';

export default function VolunteerPage() {
  const { t } = useTranslation();
  const { triggerAppletActionLoader } = useAppContext();
  const { volunteer, isLoading, error } = useMyVolunteerStatus();
  const { applyAsVolunteer } = useVolunteerMutations();

  const [volunteerForm, setVolunteerForm] = useState({ name: '', city: 'Mumbai', phone: '', role: 'Field Rescue', vehicle: false });
  const [volunteerApplied, setVolunteerApplied] = useState(false);

  // Submit Volunteer SignUp
  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (volunteerForm.phone.length !== 10) {
      alert("Provide valid 10-digit phone number");
      return;
    }
    try {
      await applyAsVolunteer({
        name: volunteerForm.name,
        email: `${volunteerForm.phone}@athiaa.org`,
        phone: volunteerForm.phone,
        city: volunteerForm.city,
        role: volunteerForm.role,
        has_vehicle: volunteerForm.vehicle,
        status: 'pending'
      } as any);
      setVolunteerApplied(true);
    } catch (err: any) {
      console.error("Volunteer registry error:", err);
      alert(`Registry failed: ${err.message || 'Validation error'}`);
    }
  };

  return (
    <div id="athiaa-volunteer-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">Become a Street Shield</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Join our Indian Volunteer Force</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          Athiaa operations are powered by local citizens! Choose from active roles and sync directly inside your city's WhatsApp Volunteer sub-chat.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans">
        
        {/* Roles checklist left side */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xl font-bold font-baloo text-deep border-b border-orange-50 pb-2">Active Field Squad Roles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              { title: "Field Catcher Patrol", desc: "Assist coordinate team physical rescue extraction of timids across metropolitan lanes.", icon: ShieldAlert },
              { title: "Vet Assist Clinic", desc: "Assist medicine feeds, change bandage splints, or comfort residents at sanctuary shelters.", icon: Stethoscope },
              { title: "Transport Drivers", desc: "Use your own hatchback car or scooter to shift injured street strays to partner clinics.", icon: Car },
              { title: "Content Creators", desc: "Take beautiful HD portrait dog photos or quick reels to speed up adoptions listings.", icon: Camera }
            ].map((role, i) => {
              const IconComp = role.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-3xl border border-orange-50 shadow-sm space-y-2">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-primary">
                    <IconComp size={20} />
                  </div>
                  <h4 className="font-bold text-deep text-sm leading-tight">{role.title}</h4>
                  <p className="text-[11px] text-gray-400 leading-normal">{role.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Group links */}
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center space-x-4">
            <MessageCircle size={32} className="text-emerald-650 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-800 text-sm">Join active city volunteer WhatsApp feeds</p>
              <p className="text-xs text-emerald-700 leading-relaxed font-sans py-0.5">Need instant feedback? Directly join coordinates in Bandra (Mumbai), Noida (Delhi) or Indiranagar (Bengaluru).</p>
              <div className="flex gap-2 flex-wrap pt-1 text-[10px] font-bold text-emerald-900">
                <a href="https://wa.me/918882470000" target="_blank" rel="noreferrer" className="bg-white border rounded px-3 py-2 flex items-center space-x-1 shadow-xs cursor-pointer">
                  <span>Mumbai Squad</span>
                  <ChevronRight size={12} />
                </a>
                <a href="https://wa.me/918882470000" target="_blank" rel="noreferrer" className="bg-white border rounded px-3 py-2 flex items-center space-x-1 shadow-xs cursor-pointer">
                  <span>Bengaluru Squad</span>
                  <ChevronRight size={12} />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Volunteer application form right column / status banner */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-orange-50 shadow-warm self-start">
          <h3 className="text-lg font-bold font-baloo text-deep border-b border-orange-50 pb-2">Volunteer Application Portal</h3>
          
          {volunteer ? (
            <div className="pt-6 space-y-4 text-center">
              <div className="w-14 h-14 bg-orange-100 text-primary rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck size={28} />
              </div>
              <h4 className="font-baloo text-xl font-bold text-deep">Active Field Agent Registration</h4>
              <p className="text-xs text-gray-500 leading-normal font-sans">
                Pranam, <span className="font-bold text-primary">{(volunteer as any).name || 'Field Agent'}</span>! Your volunteer parameters are registered securely.
              </p>
              
              <div className="bg-orange-50/60 p-4 rounded-2xl border-2 border-orange-100 font-sans text-xs text-left space-y-2 font-medium">
                <p><span className="font-bold text-deep">Registered City Area:</span> {(volunteer as any).city || 'Mumbai'}</p>
                <p><span className="font-bold text-deep">On-Call Patrol Role:</span> {(volunteer as any).role || 'Volunteer'}</p>
                <p><span className="font-bold text-deep">Activation Status:</span> <span className="text-[#2E8B57] font-extrabold uppercase">{(volunteer as any).status || 'Verified Patrol Shield'}</span></p>
              </div>
              <p className="text-[10px] text-gray-400">Squad coordinators will post physical location requirements inside the city chat rooms.</p>
            </div>
          ) : volunteerApplied ? (
            <div className="text-center py-12 space-y-4 font-sans">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Check size={28} />
              </div>
              <h4 className="font-baloo text-xl font-bold text-accent">Registration Confirmed</h4>
              <p className="text-xs text-gray-500 leading-normal">
                Pranam! Your volunteer coordinates are saved. We have dispatched onboarding credentials to your WhatsApp line.
              </p>
            </div>
          ) : (
            <form onSubmit={handleVolunteerSubmit} className="space-y-4 pt-4 text-xs font-sans text-left">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Your Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Advait Nair"
                  value={volunteerForm.name}
                  onChange={e => setVolunteerForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-cream border border-orange-50 p-2.5 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">What's your City?</label>
                  <select 
                    value={volunteerForm.city}
                    onChange={e => setVolunteerForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 p-2.5 rounded-xl text-xs outline-none focus:border-primary text-deep font-semibold"
                  >
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Delhi NCR</option>
                    <option>Pune</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Select Role Preference</label>
                  <select 
                    value={volunteerForm.role}
                    onChange={e => setVolunteerForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 p-2.5 rounded-xl text-xs outline-none focus:border-primary text-deep font-semibold"
                  >
                    <option>Field Rescue</option>
                    <option>Transport Drivers</option>
                    <option>Photographer</option>
                    <option>Social Media Tech</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left font-sans">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Active WhatsApp Phone *</label>
                <div className="relative font-mono">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-sm">+91</span>
                  <input 
                    type="tel" 
                    maxLength={10}
                    required
                    placeholder="Enter 10-digit Phone" 
                    value={volunteerForm.phone}
                    onChange={e => setVolunteerForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl py-3 pl-12 pr-4 text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="py-2">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={volunteerForm.vehicle}
                    onChange={e => setVolunteerForm(p => ({ ...p, vehicle: e.target.checked }))}
                    className="accent-primary" 
                  />
                  <span>I have my own active Scooter or Car vehicle for transport</span>
                </label>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#2E8B57] hover:bg-green-700 text-white font-bold py-3.5 rounded-xl uppercase font-baloo cursor-pointer shadow-md text-sm"
              >
                Submit Volunteers Enrollment
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
