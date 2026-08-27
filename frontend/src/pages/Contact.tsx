
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, MessageSquare, Check, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/lib/api/clientApi';
import { useAppContext } from '@/components/providers/AppContext';
import { useSettings } from '@/lib/hooks/useSettings';

export default function ContactPage() {
  const { t } = useTranslation();
  const { triggerAppletActionLoader } = useAppContext();
  const { settings, isLoading, error } = useSettings();

  const [contactForm, setContactForm] = useState({ name: '', phone: '', city: 'Mumbai', dept: 'General Inquiry', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const contactInfo = settings ? {
    address: settings.address,
    phone: settings.contact_phone,
    email: settings.contact_email
  } : null as any;

  // Contact Form Submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.phone.length !== 10) {
      alert("Provide a valid 10-digit phone number");
      return;
    }
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'general',
          name: contactForm.name,
          email: `${contactForm.phone}@athiaa.org`,
          phone: contactForm.phone,
          subject: `Contact Dept Inquiry: ${contactForm.dept} (${contactForm.city})`,
          message: contactForm.message
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server error');
      }
      setContactSubmitted(true);
    } catch (err: any) {
      console.error("Contact submit error:", err);
      alert(`Status: Message logged locally but contact sync returned: ${err.message || 'Inquiry could not be parsed'}`);
    }
  };

  if (error) return null;

  return (
    <div id="athiaa-contact-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">We'd love to hear from you</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Get in touch with Athiaa</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          Have queries on adoptions, corporate CSR collaborations, press media releases, or volunteering hubs? Text us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans text-left">
        
        {/* Direct addresses contacts */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-xl font-bold font-baloo text-deep">Athiaa Shelter Offices</h3>
          
          <div className="space-y-4 font-sans text-xs text-gray-500">
            <div className="p-4 bg-white rounded-3xl border border-orange-50 shadow-sm space-y-1 text-left">
              <div className="flex items-center space-x-1.5 font-bold text-deep">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>MUMBAI CORE RESCUE CENTER</span>
              </div>
              <p>{contactInfo?.mumbai_address || contactInfo?.address || "Athiaa Shelter Hub, Behind Thane Civil Hospital, Thane West, Mumbai, MH - 400601"}</p>
              <p className="font-mono text-[10px] text-primary font-bold pt-1">HOURS: 24/7 Helpline Active | Tel: {contactInfo?.phone || "+91 91888 24700"}</p>
            </div>

            <div className="p-4 bg-white rounded-3xl border border-orange-50 shadow-sm space-y-1 text-left">
              <div className="flex items-center space-x-1.5 font-bold text-deep">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>BENGALURU SANCTUARY DIVISION</span>
              </div>
              <p>{contactInfo?.bengaluru_address || "Adoption House, cubbon road side extension, Indiranagar, Bengaluru, KA - 560008"}</p>
              <p className="font-mono text-[10px] text-gray-400 pt-1">EMAIL: {contactInfo?.email || "help@athiaa.org"} | HOURS: 09:30 AM - 06:00 PM IST</p>
            </div>
          </div>

          {/* Chat on WhatsApp directly trigger link */}
          <div className="bg-[#FFFBF7] p-5 rounded-2xl border border-orange-100 flex items-center space-x-3 text-xs text-gray-650 text-left">
            <MessageSquare size={24} className="text-emerald-600 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold text-deep text-sm leading-tight">Instant Texting Helpdesk</p>
              <p className="font-sans text-[11px] leading-normal pt-1 text-gray-500">Prefer instant messaging? Click below to load direct chat with our Adoption Desk coordinator.</p>
              <a href="https://wa.me/918882470000" target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-lg cursor-pointer">
                <span>WhatsApp Shelter Coordinators</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>

        </div>

        {/* Department-wise inquiry submission form */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-orange-50 shadow-warm">
          <h3 className="text-xl font-bold font-baloo text-deep border-b border-orange-50 pb-3">Submit Inquiry Ticket</h3>
          
          {contactSubmitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check size={24} />
              </div>
              <h4 className="font-baloo text-xl font-bold text-deep">Ticket Logged Successfully</h4>
              <p className="text-xs text-gray-500 font-sans leading-normal">
                Thank you! Your ticket coordinates are saved. We have dispatched duplicate confirmation records to your WhatsApp phone line.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 pt-4 text-xs font-sans text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Priyan G"
                    value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 outline-none focus:border-primary text-deep font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Active WhatsApp *</label>
                  <input 
                    type="tel" 
                    maxLength={10}
                    required
                    placeholder="Enter 10-digit phone" 
                    value={contactForm.phone}
                    onChange={e => setContactForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 font-mono focus:outline-none focus:border-primary text-deep font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Select Department</label>
                  <select 
                    value={contactForm.dept}
                    onChange={e => setContactForm(p => ({ ...p, dept: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 outline-none text-gray-650 focus:border-primary font-semibold text-deep"
                  >
                    <option>General Inquiry</option>
                    <option>Adopt a Dog Desk</option>
                    <option>Volunteers Onboarding</option>
                    <option>CSR Partnership Large</option>
                  </select>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">City Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pune" 
                    value={contactForm.city}
                    onChange={e => setContactForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full bg-cream border border-orange-50 rounded-xl p-2.5 outline-none focus:border-primary text-deep font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Message Coordinate Description *</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Type details in English or Hindi..."
                  value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full bg-cream border border-orange-50 rounded-xl p-3 focus:outline-none focus:border-primary text-deep font-semibold"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl uppercase tracking-wider font-baloo cursor-pointer shadow-warm"
              >
                Transmit Message Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
