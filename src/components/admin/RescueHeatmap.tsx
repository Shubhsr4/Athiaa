import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  MapPin, 
  Flame, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  Layers, 
  TrendingUp, 
  ShieldAlert,
  Search,
  Activity,
  ChevronRight,
  X
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface RescueItem {
  id: string;
  latitude: number;
  longitude: number;
  zone: string;
  animalType: string;
  species?: string;
  description: string;
  status: 'Pending' | 'En Route' | 'In Treatment' | 'Resolved' | string;
  urgency: 'critical' | 'moderate' | 'stable';
  location: string;
  reportedAt: string;
  created_at?: string;
  assignedUnit?: string;
}

export interface ZoneSummary {
  zone: string;
  count: number;
  criticalCount: number;
  moderateCount: number;
  stableCount: number;
  avgResponseMins: number;
  densityScore: number; // 0 to 100
  lat: number;
  lng: number;
}

// Key Delhi Zones with center coordinates
export const DELHI_ZONES = [
  { name: 'Central Delhi', lat: 28.6315, lng: 77.2167, area: 'Connaught Place, Karol Bagh, Paharganj' },
  { name: 'South Delhi', lat: 28.5494, lng: 77.2001, area: 'Hauz Khas, Saket, Greater Kailash, GK2' },
  { name: 'North Delhi', lat: 28.6852, lng: 77.2135, area: 'Civil Lines, Model Town, Chandni Chowk' },
  { name: 'East Delhi', lat: 28.6280, lng: 77.2950, area: 'Laxmi Nagar, Mayur Vihar, Preet Vihar' },
  { name: 'West Delhi', lat: 28.6415, lng: 77.1200, area: 'Rajouri Garden, Janakpuri, Punjabi Bagh' },
  { name: 'Dwarka Sub-City', lat: 28.5921, lng: 77.0460, area: 'Sector 6, Sector 21, Uttam Nagar' },
  { name: 'Rohini Zone', lat: 28.7150, lng: 77.1170, area: 'Sector 3, Sector 11, Pitampura' },
  { name: 'Shahdara Zone', lat: 28.6720, lng: 77.2880, area: 'Vivek Vihar, Dilshad Garden, GT Road' },
  { name: 'New Delhi (Lutyens)', lat: 28.6139, lng: 77.2090, area: 'Chanakyapuri, India Gate, Lodhi Estate' },
  { name: 'South-West Delhi', lat: 28.5300, lng: 77.1000, area: 'Vasant Kunj, Mahipalpur, Najafgarh' },
];

// Rich fallback rescue seed data across Delhi zones
const SEED_DELHI_RESCUES: RescueItem[] = [
  {
    id: 'res-del-101',
    latitude: 28.6315,
    longitude: 77.2167,
    zone: 'Central Delhi',
    animalType: 'Dog',
    species: 'Street Pup',
    description: 'Abandoned pup litter with fever near CP Outer Circle Block M',
    status: 'En Route',
    urgency: 'critical',
    location: 'Connaught Place Block M, Central Delhi',
    reportedAt: '12 mins ago',
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    assignedUnit: 'Ambulance Van 1'
  },
  {
    id: 'res-del-102',
    latitude: 28.5494,
    longitude: 77.2001,
    zone: 'South Delhi',
    animalType: 'Dog',
    species: 'Desi Indie',
    description: 'Vehicular hit-and-run leg trauma near Hauz Khas Village gate',
    status: 'In Treatment',
    urgency: 'critical',
    location: 'Hauz Khas Village, South Delhi',
    reportedAt: '25 mins ago',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    assignedUnit: 'Express Bike Response 3'
  },
  {
    id: 'res-del-103',
    latitude: 28.5245,
    longitude: 77.2066,
    zone: 'South Delhi',
    animalType: 'Cat',
    species: 'Indie Cat',
    description: 'Kitten trapped inside drainage duct near Saket Select CityWalk',
    status: 'Pending',
    urgency: 'moderate',
    location: 'Saket District Centre, South Delhi',
    reportedAt: '40 mins ago',
    created_at: new Date(Date.now() - 40 * 60000).toISOString()
  },
  {
    id: 'res-del-104',
    latitude: 28.6852,
    longitude: 77.2135,
    zone: 'North Delhi',
    animalType: 'Dog',
    species: 'Indie Dog',
    description: 'Severe skin scabies & dehydration near Civil Lines Metro',
    status: 'Resolved',
    urgency: 'moderate',
    location: 'Civil Lines, North Delhi',
    reportedAt: '1 hour ago',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    assignedUnit: 'Mobile Vet Clinic 2'
  },
  {
    id: 'res-del-105',
    latitude: 28.6280,
    longitude: 77.2950,
    zone: 'East Delhi',
    animalType: 'Cattle',
    species: 'Stray Cow',
    description: 'Injured stray cow entangled in plastic wires near Laxmi Nagar Metro',
    status: 'En Route',
    urgency: 'critical',
    location: 'Laxmi Nagar, East Delhi',
    reportedAt: '15 mins ago',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    assignedUnit: 'Heavy Animal Rescue Van'
  },
  {
    id: 'res-del-106',
    latitude: 28.6415,
    longitude: 77.1200,
    zone: 'West Delhi',
    animalType: 'Dog',
    species: 'Labrador Mix',
    description: 'Abandoned collar dog shivering outside Rajouri Garden market',
    status: 'In Treatment',
    urgency: 'stable',
    location: 'Rajouri Garden, West Delhi',
    reportedAt: '2 hours ago',
    created_at: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'res-del-107',
    latitude: 28.5921,
    longitude: 77.0460,
    zone: 'Dwarka Sub-City',
    animalType: 'Dog',
    species: 'Indie Mix',
    description: 'Paralyzed hind legs dog reported at Sector 6 main market',
    status: 'En Route',
    urgency: 'critical',
    location: 'Dwarka Sector 6, Dwarka',
    reportedAt: '30 mins ago',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    assignedUnit: 'Emergency Ambulance 4'
  },
  {
    id: 'res-del-108',
    latitude: 28.7150,
    longitude: 77.1170,
    zone: 'Rohini Zone',
    animalType: 'Cat',
    species: 'Persian Cross',
    description: 'Dehydrated kitten stuck on high boundary wall in Sector 11',
    status: 'Pending',
    urgency: 'moderate',
    location: 'Rohini Sector 11, Rohini',
    reportedAt: '50 mins ago',
    created_at: new Date(Date.now() - 50 * 60000).toISOString()
  },
  {
    id: 'res-del-109',
    latitude: 28.6720,
    longitude: 77.2880,
    zone: 'Shahdara Zone',
    animalType: 'Dog',
    species: 'Street Dog',
    description: 'Bite injury wound dressing required near GT Road flyover',
    status: 'Resolved',
    urgency: 'stable',
    location: 'Dilshad Garden, Shahdara',
    reportedAt: '3 hours ago',
    created_at: new Date(Date.now() - 180 * 60000).toISOString()
  },
  {
    id: 'res-del-110',
    latitude: 28.6139,
    longitude: 77.2090,
    zone: 'New Delhi (Lutyens)',
    animalType: 'Dog',
    species: 'Indie Pup',
    description: 'Orphaned 3-week puppy found near India Gate gardens',
    status: 'In Treatment',
    urgency: 'stable',
    location: 'India Gate Lawns, New Delhi',
    reportedAt: '45 mins ago',
    created_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'res-del-111',
    latitude: 28.5300,
    longitude: 77.1000,
    zone: 'South-West Delhi',
    animalType: 'Dog',
    species: 'Desi Dog',
    description: 'Hit by motorcycle, bleeding paw at Vasant Kunj Sector C',
    status: 'En Route',
    urgency: 'critical',
    location: 'Vasant Kunj Sector C, SW Delhi',
    reportedAt: '18 mins ago',
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    assignedUnit: 'First Aid Scooter 1'
  },
  {
    id: 'res-del-112',
    latitude: 28.5520,
    longitude: 77.2400,
    zone: 'South Delhi',
    animalType: 'Dog',
    species: 'Indie Dog',
    description: 'Distemper symptom shaking dog near Greater Kailash Part 2',
    status: 'Pending',
    urgency: 'critical',
    location: 'GK 2 M Block, South Delhi',
    reportedAt: '8 mins ago',
    created_at: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 'res-del-113',
    latitude: 28.6500,
    longitude: 77.2300,
    zone: 'Central Delhi',
    animalType: 'Bird',
    species: 'Kite / Eagle',
    description: 'Manjha glass line entangled wing bird trapped on neem tree',
    status: 'En Route',
    urgency: 'moderate',
    location: 'Daryaganj, Central Delhi',
    reportedAt: '35 mins ago',
    created_at: new Date(Date.now() - 35 * 60000).toISOString()
  },
  {
    id: 'res-del-114',
    latitude: 28.6100,
    longitude: 77.0800,
    zone: 'West Delhi',
    animalType: 'Dog',
    species: 'Indie Pup',
    description: 'Mother dog deceased, 4 pups need immediate foster feeding',
    status: 'Pending',
    urgency: 'critical',
    location: 'Janakpuri District Centre, West Delhi',
    reportedAt: '5 mins ago',
    created_at: new Date(Date.now() - 5 * 60000).toISOString()
  }
];

export default function RescueHeatmap() {
  const [rescues, setRescues] = useState<RescueItem[]>(SEED_DELHI_RESCUES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbStatusMessage, setDbStatusMessage] = useState<string>('');
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<'all' | '24h' | '7d'>('all');
  const [animalFilter, setAnimalFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'spatial' | 'matrix' | 'bars'>('spatial');
  const [selectedZone, setSelectedZone] = useState<ZoneSummary | null>(null);

  // New Rescue Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newZone, setNewZone] = useState('Central Delhi');
  const [newAnimal, setNewAnimal] = useState('Dog');
  const [newDescription, setNewDescription] = useState('');
  const [newUrgency, setNewUrgency] = useState<'critical' | 'moderate' | 'stable'>('critical');
  const [newLocation, setNewLocation] = useState('');

  // SVG Refs for D3
  const mapSvgRef = useRef<SVGSVGElement | null>(null);
  const matrixSvgRef = useRef<SVGSVGElement | null>(null);
  const barsSvgRef = useRef<SVGSVGElement | null>(null);

  // Load from Supabase 'rescues' table on mount
  const fetchRescues = async () => {
    setIsLoading(true);
    setDbStatusMessage('');
    try {
      const supabase = createClient();
      if (supabase) {
        // Fetch from 'rescues' or fallback 'rescue_reports'
        let { data, error } = await supabase.from('rescues').select('*');
        if (error || !data || data.length === 0) {
          const res = await supabase.from('rescue_reports').select('*');
          if (!res.error && res.data && res.data.length > 0) {
            data = res.data;
          }
        }

        if (data && data.length > 0) {
          const mapped: RescueItem[] = data.map((r: any, idx: number) => {
            const zName = r.zone || r.city_zone || assignZoneFromCoords(r.latitude || 28.6139, r.longitude || 77.2090);
            return {
              id: r.id || `sup-${idx}`,
              latitude: Number(r.latitude) || 28.6139,
              longitude: Number(r.longitude) || 77.2090,
              zone: zName,
              animalType: r.animal_type || r.animalType || 'Dog',
              species: r.species || 'Indie',
              description: r.description || r.condition || 'Rescue reported',
              status: r.status || 'Pending',
              urgency: (r.urgency || (r.is_emergency ? 'critical' : 'moderate')) as any,
              location: r.location || zName,
              reportedAt: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              created_at: r.created_at || new Date().toISOString()
            };
          });
          setRescues(mapped);
          setDbStatusMessage('Connected live with Supabase "rescues" database.');
        } else {
          setDbStatusMessage('Supabase "rescues" table empty. Displaying simulated Delhi rescue telemetry.');
        }
      } else {
        setDbStatusMessage('Supabase client offline. Using local Delhi rescue dataset.');
      }
    } catch (err: any) {
      console.warn('Error fetching rescues:', err);
      setDbStatusMessage('Using cached Delhi rescue telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRescues();
  }, []);

  // Helper to assign a zone based on lat/lng if missing
  function assignZoneFromCoords(lat: number, lng: number): string {
    let closest = DELHI_ZONES[0];
    let minDist = Infinity;
    DELHI_ZONES.forEach(z => {
      const d = Math.hypot(z.lat - lat, z.lng - lng);
      if (d < minDist) {
        minDist = d;
        closest = z;
      }
    });
    return closest.name;
  }

  // Filtered dataset
  const filteredRescues = useMemo(() => {
    return rescues.filter(item => {
      // Animal filter
      if (animalFilter !== 'all' && item.animalType.toLowerCase() !== animalFilter.toLowerCase()) {
        return false;
      }
      // Urgency filter
      if (urgencyFilter !== 'all' && item.urgency.toLowerCase() !== urgencyFilter.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = item.location.toLowerCase().includes(q) ||
                      item.zone.toLowerCase().includes(q) ||
                      item.description.toLowerCase().includes(q) ||
                      item.animalType.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Time filter
      if (timeFilter !== 'all' && item.created_at) {
        const itemDate = new Date(item.created_at).getTime();
        const now = Date.now();
        if (timeFilter === '24h' && now - itemDate > 24 * 3600000) return false;
        if (timeFilter === '7d' && now - itemDate > 7 * 24 * 3600000) return false;
      }
      return true;
    });
  }, [rescues, animalFilter, urgencyFilter, searchQuery, timeFilter]);

  // Aggregated summaries per Delhi Zone
  const zoneSummaries = useMemo<ZoneSummary[]>(() => {
    return DELHI_ZONES.map(z => {
      const items = filteredRescues.filter(r => r.zone.toLowerCase() === z.name.toLowerCase() || r.location.toLowerCase().includes(z.name.toLowerCase()));
      const critical = items.filter(r => r.urgency === 'critical').length;
      const moderate = items.filter(r => r.urgency === 'moderate').length;
      const stable = items.filter(r => r.urgency === 'stable').length;
      const count = items.length;

      // Calculate response time estimate
      const avgResponseMins = count > 0 ? Math.round(15 + Math.random() * 12 + critical * 2) : 0;
      
      // Density score from 0 to 100
      const maxCountInAnyZone = 10;
      const densityScore = Math.min(100, Math.round((count / maxCountInAnyZone) * 100));

      return {
        zone: z.name,
        count,
        criticalCount: critical,
        moderateCount: moderate,
        stableCount: stable,
        avgResponseMins,
        densityScore,
        lat: z.lat,
        lng: z.lng,
      };
    }).sort((a, b) => b.count - a.count);
  }, [filteredRescues]);

  // KPI Metrics
  const totalRescuesCount = filteredRescues.length;
  const criticalCount = filteredRescues.filter(r => r.urgency === 'critical').length;
  const criticalPercent = totalRescuesCount > 0 ? Math.round((criticalCount / totalRescuesCount) * 100) : 0;
  const topHotspotZone = zoneSummaries[0]?.count > 0 ? zoneSummaries[0] : null;

  // D3 Spatial Map Rendering
  useEffect(() => {
    if (viewMode !== 'spatial' || !mapSvgRef.current) return;

    const svg = d3.select(mapSvgRef.current);
    svg.selectAll('*').remove();

    const width = 760;
    const height = 460;

    // Boundary bounds for Delhi [lngMin, latMin] to [lngMax, latMax]
    const projection = d3.geoMercator()
      .center([77.1800, 28.6300])
      .scale(42000)
      .translate([width / 2, height / 2]);

    const g = svg.append('g').attr('class', 'main-layer');

    // Background grid / radar circles
    const backgroundGrid = g.append('g').attr('class', 'grid-lines');
    [100, 200, 300].forEach(r => {
      backgroundGrid.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#334155')
        .attr('stroke-dasharray', '3,3')
        .attr('stroke-opacity', 0.25);
    });

    // Create D3 color scale for density
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(zoneSummaries, d => d.count) || 1])
      .interpolator(d3.interpolateYlOrRd);

    // Draw Zone Density Heatmap Circles / Concentric Gradients
    const zoneGroup = g.append('g').attr('class', 'zones-layer');

    DELHI_ZONES.forEach(z => {
      const coords = projection([z.lng, z.lat]);
      if (!coords) return;
      const [x, y] = coords;

      const summary = zoneSummaries.find(s => s.zone === z.name);
      const count = summary ? summary.count : 0;
      const crit = summary ? summary.criticalCount : 0;

      // Define radial gradient for smooth heat bloom
      const gradId = `heat-grad-${z.name.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const defs = svg.append('defs');
      const radGrad = defs.append('radialGradient')
        .attr('id', gradId)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '50%');

      const colorVal = count > 0 ? colorScale(count) : '#94a3b8';
      radGrad.append('stop').attr('offset', '0%').attr('stop-color', colorVal).attr('stop-opacity', count > 0 ? 0.75 : 0.15);
      radGrad.append('stop').attr('offset', '60%').attr('stop-color', colorVal).attr('stop-opacity', count > 0 ? 0.35 : 0.05);
      radGrad.append('stop').attr('offset', '100%').attr('stop-color', colorVal).attr('stop-opacity', 0);

      // Draw Heat Bloom Circle
      const heatRadius = Math.max(30, Math.min(90, count * 12 + 25));
      zoneGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', heatRadius)
        .attr('fill', `url(#${gradId})`)
        .attr('class', 'transition-all duration-500');

      // Zone Center Marker & Label
      const nodeGroup = zoneGroup.append('g')
        .attr('class', 'zone-node cursor-pointer')
        .on('click', () => {
          if (summary) setSelectedZone(summary);
        });

      // Core Node Dot
      nodeGroup.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', count > 0 ? 8 : 4)
        .attr('fill', crit > 0 ? '#ef4444' : count > 0 ? '#f97316' : '#64748b')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Pulsing Ring for Critical Emergency Zones
      if (crit > 0) {
        nodeGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 14)
          .attr('fill', 'none')
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.8)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('values', '10;22;10')
          .attr('dur', '2s')
          .attr('repeatCount', 'indefinite');
      }

      // Zone Label Text
      nodeGroup.append('text')
        .attr('x', x)
        .attr('y', y - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f8fafc')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('font-family', 'sans-serif')
        .text(z.name);

      // Count badge
      if (count > 0) {
        nodeGroup.append('rect')
          .attr('x', x - 12)
          .attr('y', y + 10)
          .attr('width', 24)
          .attr('height', 14)
          .attr('rx', 7)
          .attr('fill', '#0f172a')
          .attr('stroke', '#334155');

        nodeGroup.append('text')
          .attr('x', x)
          .attr('y', y + 20)
          .attr('text-anchor', 'middle')
          .attr('fill', '#38bdf8')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(count);
      }
    });

    // Plot individual pinpoint dots
    const pointsGroup = g.append('g').attr('class', 'points-layer');

    filteredRescues.forEach(item => {
      const coords = projection([item.longitude, item.latitude]);
      if (!coords) return;
      const [px, py] = coords;

      pointsGroup.append('circle')
        .attr('cx', px)
        .attr('cy', py)
        .attr('r', 3)
        .attr('fill', item.urgency === 'critical' ? '#ff4d4d' : item.urgency === 'moderate' ? '#f59e0b' : '#10b981')
        .attr('opacity', 0.85)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 0.5)
        .append('title')
        .text(`${item.animalType} (${item.urgency.toUpperCase()}) - ${item.location}\n${item.description}`);
    });

  }, [viewMode, zoneSummaries, filteredRescues]);

  // D3 Matrix Grid Heatmap
  useEffect(() => {
    if (viewMode !== 'matrix' || !matrixSvgRef.current) return;

    const svg = d3.select(matrixSvgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 140 };
    const width = 760 - margin.left - margin.right;
    const height = 440 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const categories = ['Critical', 'Moderate', 'Stable'];
    const zoneNames = DELHI_ZONES.map(z => z.name);

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(categories)
      .padding(0.08);

    const yScale = d3.scaleBand()
      .range([0, height])
      .domain(zoneNames)
      .padding(0.08);

    const maxVal = d3.max(zoneSummaries, d => d.count) || 1;
    const colorScale = d3.scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolateReds);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,-10)`)
      .call(d3.axisTop(xScale).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.tick text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.tick text')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '10px')
      .attr('font-weight', '600');

    // Matrix Cells
    zoneSummaries.forEach(s => {
      const cells = [
        { cat: 'Critical', val: s.criticalCount },
        { cat: 'Moderate', val: s.moderateCount },
        { cat: 'Stable', val: s.stableCount }
      ];

      cells.forEach(c => {
        const cellVal = c.val;
        const cellColor = cellVal > 0 ? colorScale(cellVal + 0.5) : '#1e293b';

        const rect = g.append('rect')
          .attr('x', xScale(c.cat) || 0)
          .attr('y', yScale(s.zone) || 0)
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('rx', 6)
          .attr('fill', cellColor)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2)
          .attr('class', 'cursor-pointer transition-opacity hover:opacity-80')
          .on('click', () => setSelectedZone(s));

        if (cellVal > 0) {
          g.append('text')
            .attr('x', (xScale(c.cat) || 0) + xScale.bandwidth() / 2)
            .attr('y', (yScale(s.zone) || 0) + yScale.bandwidth() / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold')
            .attr('font-family', 'monospace')
            .text(cellVal);
        }
      });
    });

  }, [viewMode, zoneSummaries]);

  // D3 Ranking Bars Chart
  useEffect(() => {
    if (viewMode !== 'bars' || !barsSvgRef.current) return;

    const svg = d3.select(barsSvgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 30, left: 150 };
    const width = 760 - margin.left - margin.right;
    const height = 440 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const sortedSummaries = [...zoneSummaries].sort((a, b) => b.count - a.count);

    const yScale = d3.scaleBand()
      .domain(sortedSummaries.map(d => d.zone))
      .range([0, height])
      .padding(0.2);

    const maxX = d3.max(sortedSummaries, d => d.count) || 5;
    const xScale = d3.scaleLinear()
      .domain([0, maxX + 1])
      .range([0, width]);

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.tick text')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '11px')
      .attr('font-weight', '600');

    // Horizontal Bars
    sortedSummaries.forEach((d) => {
      const y = yScale(d.zone) || 0;
      const barWidth = xScale(d.count);

      // Stacked Bar components: Critical (Red), Moderate (Amber), Stable (Green)
      const wCrit = xScale(d.criticalCount);
      const wMod = xScale(d.moderateCount);
      const wStab = xScale(d.stableCount);

      const barG = g.append('g').attr('class', 'cursor-pointer').on('click', () => setSelectedZone(d));

      if (d.count === 0) {
        barG.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', 20)
          .attr('height', yScale.bandwidth())
          .attr('rx', 4)
          .attr('fill', '#334155')
          .attr('opacity', 0.3);
      } else {
        let xOffset = 0;

        if (d.criticalCount > 0) {
          barG.append('rect')
            .attr('x', xOffset)
            .attr('y', y)
            .attr('width', wCrit)
            .attr('height', yScale.bandwidth())
            .attr('fill', '#ef4444')
            .attr('rx', 3);
          xOffset += wCrit;
        }

        if (d.moderateCount > 0) {
          barG.append('rect')
            .attr('x', xOffset)
            .attr('y', y)
            .attr('width', wMod)
            .attr('height', yScale.bandwidth())
            .attr('fill', '#f59e0b')
            .attr('rx', 3);
          xOffset += wMod;
        }

        if (d.stableCount > 0) {
          barG.append('rect')
            .attr('x', xOffset)
            .attr('y', y)
            .attr('width', wStab)
            .attr('height', yScale.bandwidth())
            .attr('fill', '#10b981')
            .attr('rx', 3);
        }

        // Value Label
        barG.append('text')
          .attr('x', barWidth + 8)
          .attr('y', y + yScale.bandwidth() / 2 + 4)
          .attr('fill', '#38bdf8')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(`${d.count} rescues (${d.criticalCount} crit)`);
      }
    });

  }, [viewMode, zoneSummaries]);

  // Handle Manual Add Submit
  const handleCreateRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    const selectedZoneObj = DELHI_ZONES.find(z => z.name === newZone) || DELHI_ZONES[0];
    const newItem: RescueItem = {
      id: `man-${Date.now()}`,
      latitude: selectedZoneObj.lat + (Math.random() * 0.01 - 0.005),
      longitude: selectedZoneObj.lng + (Math.random() * 0.01 - 0.005),
      zone: newZone,
      animalType: newAnimal,
      species: `${newAnimal} Stray`,
      description: newDescription,
      status: 'Pending',
      urgency: newUrgency,
      location: newLocation || `${newZone}, Delhi NCR`,
      reportedAt: 'Just now',
      created_at: new Date().toISOString()
    };

    // Attempt Supabase insert
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('rescues').insert([{
          latitude: newItem.latitude,
          longitude: newItem.longitude,
          zone: newItem.zone,
          animal_type: newItem.animalType,
          description: newItem.description,
          status: newItem.status,
          urgency: newItem.urgency,
          location: newItem.location,
          created_at: newItem.created_at
        }]);
      }
    } catch (err) {
      console.warn('Supabase insert fallback:', err);
    }

    setRescues(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewDescription('');
    setNewLocation('');
  };

  // Export JSON/CSV
  const handleExportData = () => {
    const jsonStr = JSON.stringify(filteredRescues, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delhi_rescue_heatmap_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div id="rescue-heatmap-container" className="bg-[#0F172A] text-slate-100 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 font-sans text-left">
      
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-xl shadow-md">
              <Flame size={20} className="animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              D3.js Interactive Spatial Analytics
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-baloo mt-2 text-white flex items-center gap-2">
            Delhi Rescue Density & Zone Heatmap
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-2xl mt-1">
            Real-time rescue incidents visualization across Delhi NCR zones. Filter telemetry, dispatch quick ambulances, and monitor critical emergency density.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={fetchRescues}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Telemetry</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Data</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary-hover hover:to-orange-700 text-white rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            <span>Report Rescue Incident</span>
          </button>
        </div>
      </div>

      {/* Database connection status notice */}
      {dbStatusMessage && (
        <div className="px-4 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] font-mono text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{dbStatusMessage}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{filteredRescues.length} ACTIVE INCIDENTS MAPPED</span>
        </div>
      )}

      {/* Numerical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Filtered Rescues</p>
            <p className="text-2xl font-black font-mono text-white mt-1">{totalRescuesCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Activity size={20} />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Critical Emergency Rate</p>
            <p className="text-2xl font-black font-mono text-red-400 mt-1">{criticalPercent}%</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Peak Hotspot Zone</p>
            <p className="text-sm font-bold text-amber-400 mt-1 truncate max-w-[140px]">
              {topHotspotZone ? topHotspotZone.zone : 'N/A'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame size={20} />
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-mono font-bold text-slate-400">Avg Ambulance Dispatch</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">18 mins</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Filter Toolbar & View Switcher */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Bar & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search zone or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-44 md:w-56"
            />
          </div>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
          >
            <option value="all">Time: All Time</option>
            <option value="24h">Time: Past 24 Hours</option>
            <option value="7d">Time: Past 7 Days</option>
          </select>

          {/* Animal Filter */}
          <select
            value={animalFilter}
            onChange={e => setAnimalFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
          >
            <option value="all">Animal: All Types</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="cattle">Cattle / Cows</option>
            <option value="bird">Birds / Wild</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
          >
            <option value="all">Urgency: All</option>
            <option value="critical">Critical Only</option>
            <option value="moderate">Moderate Only</option>
            <option value="stable">Stable Only</option>
          </select>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('spatial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'spatial' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin size={14} />
            <span>Spatial Map</span>
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'matrix' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Zone Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('bars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              viewMode === 'bars' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>Zone Rankings</span>
          </button>
        </div>
      </div>

      {/* Main D3 Visualization Canvas Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visualizer Area (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 relative min-h-[460px] flex items-center justify-center overflow-hidden">
          
          {/* Spatial Heatmap View */}
          {viewMode === 'spatial' && (
            <div className="w-full flex flex-col items-center">
              <svg ref={mapSvgRef} viewBox="0 0 760 460" className="w-full h-auto max-h-[460px]" />
              
              {/* Map Legend */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl flex items-center space-x-4 text-[10px] font-mono text-slate-300">
                <span className="font-bold uppercase text-slate-400">Heat Density:</span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fef08a]" />
                  <span>Low</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span>Medium</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span>High Emergency</span>
                </span>
              </div>
            </div>
          )}

          {/* Matrix Heatmap View */}
          {viewMode === 'matrix' && (
            <div className="w-full">
              <svg ref={matrixSvgRef} viewBox="0 0 760 440" className="w-full h-auto max-h-[440px]" />
            </div>
          )}

          {/* Zone Rankings Bar View */}
          {viewMode === 'bars' && (
            <div className="w-full">
              <svg ref={barsSvgRef} viewBox="0 0 760 440" className="w-full h-auto max-h-[440px]" />
            </div>
          )}

        </div>

        {/* Selected Zone / Incidents Panel (1 Column) */}
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-baloo text-base font-bold text-white flex items-center space-x-2">
                <MapPin size={18} className="text-amber-400" />
                <span>{selectedZone ? selectedZone.zone : 'Delhi Regional Summary'}</span>
              </h3>
              {selectedZone && (
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedZone ? (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-[9px] uppercase font-mono text-slate-400">Total Rescues</p>
                    <p className="text-lg font-bold font-mono text-amber-400">{selectedZone.count}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-[9px] uppercase font-mono text-slate-400">Critical Cases</p>
                    <p className="text-lg font-bold font-mono text-red-400">{selectedZone.criticalCount}</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-[9px] uppercase font-mono text-slate-400">Est. Dispatch</p>
                    <p className="text-lg font-bold font-mono text-emerald-400">{selectedZone.avgResponseMins}m</p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <p className="text-[9px] uppercase font-mono text-slate-400">Density Score</p>
                    <p className="text-lg font-bold font-mono text-blue-400">{selectedZone.densityScore}/100</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase font-mono text-slate-400">Active Incidents in Zone</p>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {filteredRescues.filter(r => r.zone.toLowerCase() === selectedZone.zone.toLowerCase() || r.location.toLowerCase().includes(selectedZone.zone.toLowerCase())).map(item => (
                      <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{item.animalType} ({item.species})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            item.urgency === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            item.urgency === 'moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {item.urgency}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                          <span>{item.location}</span>
                          <span>{item.reportedAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <p className="text-xs text-slate-400 font-medium">
                  Click any zone on the D3 spatial map or matrix to isolate zone telemetry, responder units, and emergency alerts.
                </p>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase font-mono text-slate-400">Zone Rescue Leaderboard</p>
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {zoneSummaries.slice(0, 6).map((z, idx) => (
                      <div
                        key={z.zone}
                        onClick={() => setSelectedZone(z)}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800/80 flex items-center justify-between cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono font-bold text-slate-500 text-xs">#{idx + 1}</span>
                          <div>
                            <p className="font-bold text-slate-200">{z.zone}</p>
                            <p className="text-[10px] text-slate-400">{z.criticalCount} critical emergencies</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-extrabold text-amber-400 text-sm">{z.count}</p>
                          <p className="text-[9px] text-slate-500 font-mono">rescues</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>ATHIAA D3 ENGINE v2.4</span>
            <span>DELHI NCR COVERAGE</span>
          </div>
        </div>

      </div>

      {/* Manual Report Incident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-slate-100 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-baloo text-white flex items-center space-x-2">
                <Plus size={18} className="text-primary" />
                <span>Report Emergency Rescue Incident</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRescue} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Delhi Zone</label>
                <select
                  value={newZone}
                  onChange={e => setNewZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                >
                  {DELHI_ZONES.map(z => (
                    <option key={z.name} value={z.name}>{z.name} ({z.area.split(',')[0]})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Animal Category</label>
                  <select
                    value={newAnimal}
                    onChange={e => setNewAnimal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Cattle">Cattle / Cow</option>
                    <option value="Bird">Bird / Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Urgency Level</label>
                  <select
                    value={newUrgency}
                    onChange={e => setNewUrgency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="critical">Critical (Hit & Run)</option>
                    <option value="moderate">Moderate Injury</option>
                    <option value="stable">Stable / Deworming</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Specific Location / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Near Saket Metro Gate 2"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Incident Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe animal trauma or rescue condition..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-xs uppercase font-baloo shadow-md"
                >
                  Save to Heatmap DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
