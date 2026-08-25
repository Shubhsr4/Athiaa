
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/api/clientApi';
import { 
  AlertCircle, 
  MapPin, 
  Phone, 
  Activity, 
  Plus, 
  Check, 
  Sparkles,
  Info,
  Clock,
  Compass,
  ShieldAlert,
  Camera,
  Car,
  Navigation,
  CheckCircle2,
  Send
} from 'lucide-react';
import { RescueReport as TypeRescueReport } from '@/src/types';
import { useAppContext } from '@/components/providers/AppContext';
import DelhiMap, { RescueReport } from '@/src/components/DelhiMap';
import { useRescueReports } from '@/lib/hooks/useRescueReports';
import ImageUploader from '@/src/components/ImageUploader';

export default function RescuePage() {
  const { t } = useTranslation();
  const { 
    triggerAppletActionLoader, 
  } = useAppContext();

  const { reports: initialReports } = useRescueReports();
  const [customUserReports, setCustomUserReports] = useState<RescueReport[]>([]);

  const handleSubmitRescueReport = async (report: any) => {
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'rescue',
          name: report.reporterName || 'Anonymous Caretaker',
          email: `${report.reporterWhatsApp}@athiaa.org`,
          phone: report.reporterWhatsApp,
          subject: `EMERGENCY Rescue: ${report.animalType} - ${report.condition}`,
          message: `Location: ${report.location} (Landmark: ${report.landmark}, Pin: ${report.pincode}). Emergency dispatch requested.`
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Connection failed');
      }
    } catch (err: any) {
      console.error("Rescue submit error:", err);
      alert(`Offline mode fallback: report saved locally but dynamic server registry replied: ${err.message || 'Unable to sync contact'}`);
    }
  };

  // States of reporting
  const [animalType, setAnimalType] = useState<'Dog' | 'Cat' | 'Bird' | 'Other'>('Dog');
  const [condition, setCondition] = useState<RescueReport['condition']>('Injured');
  const [location, setLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterWhatsApp, setReporterWhatsApp] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState<string | null>(null);

  // Simulated live field rescue squad
  const [fieldSquad] = useState([
    { id: 'sqd-1', name: 'Mobile Ambulance Van Delhi', city: 'Delhi NCR', pin: '110001', status: 'On Route', phone: '+919876543210' },
    { id: 'sqd-2', name: 'Scooter Patrol Lead Kartik', city: 'Delhi NCR', pin: '110016', status: 'Available', phone: '+919876543211' },
    { id: 'sqd-3', name: 'Ambulance Van South Delhi', city: 'Delhi NCR', pin: '110017', status: 'Vet Clinic', phone: '+919876543212' },
    { id: 'sqd-4', name: 'Scooter Responder North Delhi', city: 'Delhi NCR', pin: '110007', status: 'Available', phone: '+919876543213' }
  ]);

  // Statistics datasets
  const injuryTypesStats = [
    { type: 'Vehicular Hit-and-Run', pct: 48, color: 'bg-red-500' },
    { type: 'Dehydration & Heat Injury', pct: 22, color: 'bg-amber-500' },
    { type: 'Skin scabies & infection', pct: 18, color: 'bg-yellow-500' },
    { type: 'Viral Canine Distemper', pct: 12, color: 'bg-purple-500' }
  ];

  const handleMockImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFileUrl('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400');
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !reporterWhatsApp || reporterWhatsApp.length !== 10) {
      alert("Provide precise location address and valid 10-digit WhatsApp phone");
      return;
    }

    triggerAppletActionLoader("Assigning rescue coordinates...", "Locking mobile cellular telemetry...", () => {
      triggerAppletActionLoader("Dispatching Athiaa Field scooter...", "Notifying local area coordinator groups...", () => {
        const reportPayload: TypeRescueReport = {
          id: `rep-${Date.now()}`,
          animalType: animalType,
          condition: condition,
          location: location,
          landmark: landmark,
          pincode: pincode,
          reporterName: reporterName || 'Anonymous Caretaker',
          reporterWhatsApp: reporterWhatsApp.replace(/\D/g, ''),
          isEmergency: isEmergency,
          photoUrl: imageFileUrl || undefined,
          status: 'Dispatching',
          submittedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          assignedVolunteer: isEmergency ? 'Express Ambulance Van 2' : 'Area Partner Clinic'
        };

        const delhiCenter = [28.6139, 77.2090];
        const newMapReport: RescueReport = {
          id: `map-rep-${Date.now()}`,
          latitude: delhiCenter[0] + (Math.random() * 0.02 - 0.01),
          longitude: delhiCenter[1] + (Math.random() * 0.02 - 0.01),
          animalType: animalType,
          description: `${condition}: ${location} (${landmark})`,
          status: 'Dispatching',
          city: 'Delhi',
          location: location || 'Delhi NCR',
          reportedAt: 'Just now',
          urgency: isEmergency ? 'critical' : 'moderate'
        };
        setCustomUserReports(prev => [newMapReport, ...prev]);

        handleSubmitRescueReport(reportPayload);

        // Reset form inputs
        setLocation('');
        setLandmark('');
        setPincode('');
        setReporterName('');
        setReporterWhatsApp('');
        setIsEmergency(false);
        setImageFileUrl(null);

        alert("EMERGENCY DISPATCH TRANSMITTED!\nOur team has received your report. The coordinate pin-drop has been routed over our volunteer WhatsApp broadcast list.");
      });
    });
  };

  return (
    <div id="athiaa-rescue-module" className="max-w-7xl mx-auto px-4 py-16 space-y-12 text-left font-sans">
      {/* 1. Header Area with big telephone CTA */}
      <div className="bg-gradient-to-r from-red-500 to-[#E8572A] rounded-3xl p-8 md:p-12 text-white text-left shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="space-y-4 md:max-w-xl">
          <span className="bg-white/25 text-white border border-white/20 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono flex items-center w-max gap-1.5">
            <ShieldAlert size={12} className="text-white" />
            <span>{t('rescue.emergencyNotice')}</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-baloo leading-tight">{t('rescue.title')}</h1>
          <p className="text-sm text-red-50 leading-relaxed font-sans">
            {t('rescue.subtitle')}
          </p>
        </div>

        <div className="space-y-3 w-full md:w-auto text-center md:text-right shrink-0">
          <p className="text-xs font-mono font-bold tracking-widest text-red-100 uppercase font-sans whitespace-nowrap">CLICK TO CALL FROM MOBILE</p>
          <a 
            href="tel:+918882470000" 
            className="inline-flex items-center justify-center space-x-3 bg-white text-[#E8572A] font-extrabold hover:bg-[#FFF9F4] text-xl md:text-3xl px-8 py-4 rounded-2xl shadow-lg transition-transform hover:-translate-y-1 whitespace-nowrap cursor-pointer"
          >
            <Phone size={24} className="animate-bounce shrink-0" />
            <span className="whitespace-nowrap">+91 8882 470000</span>
          </a>
          <p className="text-[10px] text-red-100 font-sans whitespace-nowrap">National Stray Veterinary Dispatch. (IST Timing Only)</p>
        </div>
      </div>

      {/* 2. Main Module Division with Report and GPS Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* REPORT FORM COMPONENT */}
        <div className="lg:col-span-6 bg-white p-6 md:p-8 rounded-3xl border border-orange-50 shadow-warm space-y-6">
          <div className="border-b border-orange-50 pb-3">
            <h3 className="font-baloo text-2xl font-bold text-deep flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-primary" />
              <span>{t('rescue.reportFormTitle')}</span>
            </h3>
            <p className="text-xs text-gray-500 font-sans mt-0.5">Filing takes under 60 seconds. Our coordinator dispatches to active local feeds.</p>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs font-sans text-left">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Animal Category</label>
                <div className="flex gap-2">
                  {(['Dog', 'Cat', 'Other'] as const).map((type) => (
                    <button 
                      key={type}
                      type="button"
                      onClick={() => setAnimalType(type)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition duration-200 cursor-pointer ${
                        animalType === type ? 'bg-orange-50 text-primary border-primary' : 'bg-white text-gray-500 hover:bg-cream'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Stray Condition Index</label>
                <select 
                  value={condition} 
                  onChange={e => setCondition(e.target.value as any)}
                  className="w-full bg-cream border border-orange-50 p-2 text-xs rounded-xl focus:outline-none focus:border-primary text-deep font-semibold"
                >
                  <option value="Injured">Hit-by-vehicle injury</option>
                  <option value="Sick">Sick/Severe Dehydration</option>
                  <option value="Abandoned Litter">Abandoned pup litter</option>
                  <option value="Trapped">Trapped in drain/gutter</option>
                  <option value="Other">Minor skin scabies</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">{t('rescue.rescueLocation')} *</label>
              <input 
                type="text" 
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Opposite CCD Café, Road No 4, Bandra West"
                className="w-full bg-cream border border-orange-50 rounded-xl p-3 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Crucial Local Landmark *</label>
                <input 
                  type="text" 
                  required
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Next to ICICI ATM cabin"
                  className="w-full bg-cream border border-orange-50 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">City PINCODE *</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 400050"
                  className="w-full bg-cream border border-orange-50 rounded-xl p-3 font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <ImageUploader
              bucket="media-gallery"
              folder="rescue-reports"
              label={t('rescue.uploadPhoto')}
              value={imageFileUrl || ''}
              onChange={(url) => setImageFileUrl(url)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">{t('rescue.reporterName')}</label>
                <input 
                  type="text" 
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  className="w-full bg-cream border border-orange-50 rounded-xl p-3 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">{t('rescue.reporterPhone')} *</label>
                <div className="relative font-sans">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">+91</span>
                  <input 
                    type="tel" 
                    maxLength={10}
                    required
                    value={reporterWhatsApp}
                    onChange={e => setReporterWhatsApp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit Phone" 
                    className="w-full bg-cream border border-orange-50 rounded-xl py-3 pl-12 pr-4 font-mono focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Emergency toggle */}
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <p className="font-bold text-red-700 text-xs flex items-center"><AlertCircle size={12} className="mr-1 inline animate-ping-slow" /> CRITICAL DANGER WARNING</p>
                <p className="text-[10px] text-red-600 leading-relaxed">Toggle if the injury requires surgical ambulance immediately.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isEmergency}
                  onChange={e => setIsEmergency(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase tracking-wider shadow-warm font-baloo text-base cursor-pointer flex items-center justify-center gap-2"
            >
              <Send size={18} />
              <span>{t('rescue.submitReport')}</span>
            </button>
          </form>
        </div>

        {/* INTERACTIVE RESCUE ZONE VECTOR DASHBOARD */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-6 flex flex-col justify-between self-stretch text-left">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-baloo text-lg font-bold text-deep flex items-center gap-2">
                  <Compass size={18} className="text-primary" />
                  <span>Active Rescue Radar</span>
                </h4>
                <p className="text-[10px] text-gray-500 font-sans">Simulating active emergency vehicles & reports</p>
              </div>
              
              <div className="flex items-center space-x-1 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full text-[10px] font-bold text-primary">
                <span>DELHI NCR HUB</span>
              </div>
            </div>

            {/* Interactive Leaflet + OpenStreetMap Live Rescue Radar */}
            <DelhiMap 
              reports={[...initialReports, ...customUserReports]} 
              height="h-[360px] md:h-[420px]" 
            />

            {/* List of squads in Delhi */}
            <div className="space-y-3 pt-2 text-xs">
              <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider leading-none">Ambulance Telemetry Status Indicator (Delhi)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                {fieldSquad.map((sq) => {
                  const colors: Record<string, string> = { 'Available': 'bg-green-500', 'On Route': 'bg-amber-500 animate-pulse', 'Vet Clinic': 'bg-sky-500' };
                  return (
                    <div key={sq.id} className="bg-slate-50 border px-3 py-2 rounded-xl flex items-center justify-between border-gray-150">
                      <div className="space-y-0.5">
                        <p className="font-bold leading-tight text-deep">{sq.name}</p>
                        <p className="text-[9px] text-gray-400 font-mono">Pincode Reach: {sq.pin}</p>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors[sq.status] || 'bg-gray-400'}`}></span>
                        <span className="text-[10px] font-bold text-gray-600 capitalize">{sq.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* PROCEDURAL WARNING BANNER */}
          <div className="bg-[#1C1C2E] text-white p-4 rounded-2xl flex items-center space-x-3 text-xs w-full">
            <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-secondary">Indian Stray Protection Covenant Guidelines</p>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5 leading-normal">
                If the stray shows aggression or territorial warning growls, do not isolate or force leash them yourself. Wait for the designated rescue volunteers with specialist nets.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 3. RESCUE ROAD INFOGRAPHIC */}
      <section className="space-y-6 text-center max-w-5xl mx-auto z-10 relative">
        <h3 className="text-2xl font-bold font-baloo text-deep">Our Action Pathway Matrix</h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">From citizen trauma detection to building safe adoption ready state records.</p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-left font-sans text-xs">
          {[
            { step: "01", name: "Report", p: "Citizen reports coordinates + photo via chat" },
            { step: "02", name: "Helpline", p: "Coord locks location PIN and dispatch alerts" },
            { step: "03", name: "Scoot-Rescue", p: "Vehicle team reaches scene in 15-20 mins" },
            { step: "04", name: "First-Aid", p: "Timely bleeding arrest & splint brace fits info" },
            { step: "05", name: "Vet ICU", p: "Professional surgeries & vaccination" },
            { step: "06", name: "Sanctuary", p: "Rehab inside Athiaa shelter residential sections" }
          ].map((inf, i) => (
            <div key={i} className="bg-[#FFFBF7] border border-orange-100 p-4 rounded-2xl text-left space-y-2 relative overflow-hidden flex flex-col justify-between">
              <span className="text-xl font-bold font-mono text-primary/30">{inf.step}</span>
              <div>
                <p className="font-bold text-deep text-sm leading-tight">{inf.name}</p>
                <p className="text-gray-500 text-[11px] mt-1 leading-normal">{inf.p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. STATISTICS CHARTS */}
      <section className="bg-white p-8 rounded-3xl border border-orange-50 shadow-warm font-sans max-w-5xl mx-auto text-left grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        <div className="space-y-4">
          <span className="text-primary font-bold tracking-widest uppercase text-xs font-mono">Transparency Statistics</span>
          <h3 className="text-2xl font-bold font-baloo text-deep leading-tight">Emergency Injury Breakdown</h3>
          <p className="text-xs text-gray-600 leading-normal">
            A major part of animal suffering stems from high speed traffic issues. This chart maps the average trauma reasons among the past 2,450 successfully registered rescues in Indian metropolitan areas.
          </p>

          <div className="space-y-3 pt-2">
            {injuryTypesStats.map((st, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold font-mono text-gray-700">
                  <span>{st.type}</span>
                  <span className="text-primary">{st.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${st.color}`} style={{ width: `${st.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cream/40 p-6 rounded-2xl border border-orange-100/50 space-y-4 relative text-left">
          <h4 className="text-base font-bold font-baloo text-deep border-b border-orange-50 pb-2 flex items-center gap-2">
            <Phone size={16} className="text-primary" />
            <span>Direct Coordinate Volunteers Network</span>
          </h4>
          <p className="text-xs text-gray-600 font-sans leading-normal">Want to help as an emergency transport buddy? Volunteers with own hatchbacks or scooters are added to local emergency coordination sub-chats.</p>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-white rounded-xl border border-orange-50">
              <Car className="w-5 h-5 text-primary mb-1" />
              <p className="font-bold text-deep text-xs leading-tight mt-1">Car Rescue Squad</p>
              <p className="text-[10px] text-gray-400 font-sans">45 Active cities tripods</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-orange-50">
              <Navigation className="w-5 h-5 text-primary mb-1" />
              <p className="font-bold text-deep text-xs leading-tight mt-1">Scooty Responders</p>
              <p className="text-[10px] text-gray-400 font-sans">120 Active local pin drops</p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button 
              type="button"
              className="text-white bg-accent hover:bg-green-700 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 mx-auto cursor-pointer"
            >
              <span>Apply to Join Local Rescue Drivers</span>
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
