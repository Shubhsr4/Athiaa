import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Dr. Shruti Sharma', role: 'Co-founder & Chief Rescue Director', city: 'Mumbai', bio: 'Former corporate executive who left a 12-year tech career to establish Athiaa. Oversees our active mobile medical units.' },
  { name: 'Dr. Anand Rao', role: 'Head of Veterinary Services', city: 'Bengaluru', bio: 'Orthopedic veterinary surgeon with 15+ years experience treating accident-trauma street strays.' },
  { name: 'Kartik Somani', role: 'Rescue Lead & Field Dispatcher', city: 'Delhi NCR', bio: 'Lead rescue coordinator with over 8,000 successful street rescue extractions completed.' },
  { name: 'Pooja Chawla', role: 'Adoption & Foster Coordinator', city: 'Pune', bio: 'Evaluates applications, matches dogs with prospective parents, and conducts home inspections.' }
];

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div id="athiaa-about-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">{t('nav.about')}</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">{t('about.title')}</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          {t('about.subtitle')}
        </p>
      </div>

      {/* Founding Story visual panel */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-50 shadow-warm grid grid-cols-1 lg:grid-cols-12 gap-12 items-center font-sans text-left">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-accent font-bold font-mono text-xs uppercase tracking-wider block">{t('about.storyTitle')}</span>
          <h3 className="text-2xl font-bold font-baloo text-deep block leading-tight">{t('about.missionTitle')}</h3>
          <p className="text-xs text-gray-650 leading-relaxed font-sans">
            {t('about.missionDesc')}
          </p>
          <p className="text-xs text-gray-650 leading-relaxed font-sans">
            {t('about.visionDesc')}
          </p>
        </div>
        <div className="lg:col-span-5 rounded-2xl overflow-hidden shadow-warm h-64 grayscale hover:grayscale-0 transition duration-500">
          <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600" alt="Rescued Street dog" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      </div>

      {/* Team Portraits grid */}
      <div className="space-y-4 font-sans text-center">
        <h3 className="text-2xl font-bold font-baloo text-deep">{t('about.teamTitle')}</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 text-left">
          {TEAM_MEMBERS.map((tm, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-orange-50 shadow-sm text-left flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold mb-3">
                  <User size={24} />
                </div>
                {/* TODO: dynamic content — needs bilingual DB columns if translation required */}
                <h4 className="font-bold text-deep leading-tight text-sm">{tm.name}</h4>
                <p className="text-[10px] text-primary font-mono select-none uppercase mt-0.5">{tm.role} ({tm.city})</p>
              </div>
              <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">{tm.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
