import useSWR from 'swr';
import { defaultFetcher } from './fetcher';
import { RescueReport } from '@/src/components/RescueMap';

export const DEFAULT_RESCUE_REPORTS: RescueReport[] = [
  {
    id: 'rep-mumbai-1',
    latitude: 19.0596,
    longitude: 72.8295,
    animalType: 'Dog',
    species: 'Indie Dog',
    description: 'Hit-and-run leg trauma near Bandra Station West',
    status: 'Ambulance En Route',
    city: 'Mumbai',
    location: 'Bandra West, Mumbai',
    reportedAt: '10 mins ago',
    urgency: 'critical'
  },
  {
    id: 'rep-mumbai-2',
    latitude: 19.1197,
    longitude: 72.8464,
    animalType: 'Cat',
    species: 'Persian Cross',
    description: 'Dehydrated kitten trapped under flyover',
    status: 'Scooter Responder Assigned',
    city: 'Mumbai',
    location: 'Andheri East, Mumbai',
    reportedAt: '25 mins ago',
    urgency: 'moderate'
  },
  {
    id: 'rep-delhi-1',
    latitude: 28.6315,
    longitude: 77.2167,
    animalType: 'Dog',
    species: 'Street Pup',
    description: 'Abandoned pup litter near CP Block Inner Circle',
    status: 'Foster Pickup Scheduled',
    city: 'Delhi',
    location: 'Connaught Place, Delhi',
    reportedAt: '40 mins ago',
    urgency: 'stable'
  },
  {
    id: 'rep-delhi-2',
    latitude: 28.5494,
    longitude: 77.2001,
    animalType: 'Dog',
    species: 'Desi Indie',
    description: 'Severe skin scabies & fever reported near Hauz Khas Village',
    status: 'Vet Clinic En Route',
    city: 'Delhi',
    location: 'Hauz Khas, Delhi',
    reportedAt: '15 mins ago',
    urgency: 'moderate'
  },
  {
    id: 'rep-bengaluru-1',
    latitude: 12.9784,
    longitude: 77.6408,
    animalType: 'Dog',
    species: 'Indie Dog',
    description: 'Paralyzed hind limbs dog needs immediate spinal exam',
    status: 'Surgical Unit Dispatch',
    city: 'Bengaluru',
    location: 'Indiranagar 100ft Rd, Bengaluru',
    reportedAt: '5 mins ago',
    urgency: 'critical'
  },
  {
    id: 'rep-bengaluru-2',
    latitude: 12.9352,
    longitude: 77.6245,
    animalType: 'Dog',
    species: 'Indie Mix',
    description: 'Deworming & vaccination request for 5 community strays',
    status: 'Community Feeder On Site',
    city: 'Bengaluru',
    location: 'Koramangala 5th Block, Bengaluru',
    reportedAt: '1 hour ago',
    urgency: 'stable'
  },
  {
    id: 'rep-pune-1',
    latitude: 18.5362,
    longitude: 73.8940,
    animalType: 'Cat',
    species: 'Indie Cat',
    description: 'Rescue needed: Kitten stuck in stormwater drain',
    status: 'Rescue Net Deployed',
    city: 'Pune',
    location: 'Koregaon Park, Pune',
    reportedAt: '30 mins ago',
    urgency: 'moderate'
  },
  {
    id: 'rep-hyderabad-1',
    latitude: 17.4156,
    longitude: 78.4347,
    animalType: 'Dog',
    species: 'Indie Pup',
    description: 'Ear injury requiring antiseptic dressing and rabies booster',
    status: 'First Aid Administered',
    city: 'Hyderabad',
    location: 'Banjara Hills, Hyderabad',
    reportedAt: '50 mins ago',
    urgency: 'stable'
  },
  {
    id: 'rep-kolkata-1',
    latitude: 22.5532,
    longitude: 88.3524,
    animalType: 'Dog',
    species: 'Indie Dog',
    description: 'Lacerated paw from glass debris near metro exit',
    status: 'Mobile Vet Dispatched',
    city: 'Kolkata',
    location: 'Park Street, Kolkata',
    reportedAt: '12 mins ago',
    urgency: 'critical'
  }
];

export function useRescueReports() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/rescue-reports',
    async (url) => {
      try {
        const res = await defaultFetcher(url);
        return res;
      } catch {
        return { data: DEFAULT_RESCUE_REPORTS };
      }
    },
    { fallbackData: { data: DEFAULT_RESCUE_REPORTS } }
  );

  const raw = data?.data && Array.isArray(data.data) && data.data.length > 0 ? data.data : DEFAULT_RESCUE_REPORTS;

  // Filter valid reports with latitude and longitude
  const reports: RescueReport[] = raw.filter(
    (r: any) => r && typeof r.latitude === 'number' && typeof r.longitude === 'number' && !isNaN(r.latitude) && !isNaN(r.longitude)
  );

  return {
    reports: reports.length > 0 ? reports : DEFAULT_RESCUE_REPORTS,
    isLoading,
    error,
    mutate
  };
}
