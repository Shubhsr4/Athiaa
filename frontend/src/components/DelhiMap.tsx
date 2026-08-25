import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix Leaflet's default marker icon bundler issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Rescue Pin Icon (Red for emergency)
const rescueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface RescueReport {
  id: string;
  latitude: number;
  longitude: number;
  animalType?: string;
  species?: string;
  description?: string;
  status?: string;
  city?: string;
  location?: string;
  reportedAt?: string;
  created_at?: string;
  urgency?: 'critical' | 'moderate' | 'stable' | string;
  image?: string;
  [key: string]: any;
}

interface DelhiMapProps {
  reports?: RescueReport[];
  height?: string;
  className?: string;
}

const DELHI_CENTER: [number, number] = [28.6139, 77.2090];
const DELHI_ZOOM = 11;

export default function DelhiMap({
  reports = [],
  height = 'h-[400px] md:h-[500px]',
  className = ''
}: DelhiMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter valid reports and restrict to Delhi NCR if city field exists
  const delhiReports = reports.filter(r => {
    if (!r || typeof r.latitude !== 'number' || typeof r.longitude !== 'number' || isNaN(r.latitude) || isNaN(r.longitude)) {
      return false;
    }
    if (r.city) {
      const c = r.city.toLowerCase();
      return c.includes('delhi') || c.includes('ncr');
    }
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // already initialized

    const map = L.map(containerRef.current, {
      center: DELHI_CENTER,
      zoom: DELHI_ZOOM,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    delhiReports.forEach(r => {
      const animalName = r.animalType || r.species || 'Animal';
      const reportCity = r.city || r.location || 'Delhi NCR';
      const statusText = r.status || 'Active Dispatch';
      const timeText = r.reportedAt || (r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recently');

      const popupContent = `
        <div style="padding: 4px; max-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(232, 87, 42, 0.12); color: #E8572A; text-transform: uppercase;">
              ${animalName}
            </span>
            <span style="font-size: 10px; color: #64748b;">
              ${timeText}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; line-height: 1.3;">
            ${r.description ? (r.description.length > 60 ? r.description.slice(0, 60) + '...' : r.description) : `Rescue call in ${reportCity}`}
          </h4>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            <svg style="width:12px; height:12px; flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${reportCity}</span>
          </div>
          <div style="font-size: 11px; font-weight: 600; padding-top: 6px; border-top: 1px solid #f1f5f9; color: ${statusText.toLowerCase().includes('resolved') ? '#059669' : '#d97706'};">
            ● ${statusText}
          </div>
        </div>
      `;

      const marker = L.marker([r.latitude, r.longitude], { icon: rescueIcon })
        .bindPopup(popupContent)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [delhiReports]);

  return (
    <div className={`relative w-full ${height} ${className} rounded-2xl overflow-hidden shadow-lg border border-orange-100`}>
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-slate-800 shadow-md border border-gray-200/80 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        <span>{delhiReports.length} Live Emergency Reports (Delhi)</span>
      </div>
      <div ref={containerRef} className="w-full h-full z-0" />
    </div>
  );
}
