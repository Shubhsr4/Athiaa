export type BreedType = 'INDog' | 'Labrador Mix' | 'GSD Mix' | 'Indie Mix' | 'Cocker Spaniel Mix';
export type AgeType = 'Puppy' | 'Young' | 'Adult' | 'Senior';
export type SizeType = 'Small' | 'Medium' | 'Large';
export type GenderType = 'Male' | 'Female';
export type DogStatus = 'Available' | 'Adoption Pending' | 'Adopted' | 'Urgent Care' | 'Under Rehab' | 'Fostered';

export interface Dog {
  id: string;
  name: string;
  species?: 'Dog' | 'Cat' | 'Cow' | 'Hamster' | 'Rabbit' | 'Other';
  breed: string;
  age: AgeType;
  size: SizeType;
  gender: GenderType;
  energyLevel: 'Low' | 'Medium' | 'High';
  goodWithKids: boolean;
  goodWithOtherPets: boolean;
  city: string;
  specialNeeds: boolean;
  personalityTags: string[];
  medicalBadges: {
    vaccinated: boolean;
    neutered: boolean;
    dewormed: boolean;
    microchipped: boolean;
  };
  image: string;
  lifeStory: string;
  weight: string; // e.g. "14 kg"
  personalityRadar: {
    playful: number; // 0-100
    friendly: number;
    calm: number;
    energetic: number;
    independent: number;
    affectionate: number;
  };
  videoUrl?: string;
  rescueStory: string;
}

export interface AdoptionApplication {
  id: string;
  dogId: string;
  dogName: string;
  dogImage: string;
  status: 'In Review' | 'Home Visit Scheduled' | 'Approved' | 'Rejected' | 'More Info Required';
  submittedAt: string;
  
  // Step 1: Personal
  fullName: string;
  age: number;
  idType: 'Aadhaar' | 'PAN';
  idNumber: string;
  phone: string;
  email: string;
  city: string;
  pincode: string;

  // Step 2: Home
  ownership: 'Own' | 'Renting';
  homeType: 'House' | 'Apartment';
  outdoorSpace: 'Yes, secure yard' | 'Yes, open balcony' | 'No';
  landlordPermission: boolean;

  // Step 3: Lifestyle
  workingHours: string;
  dailyRoutine: string;
  householdMembersCount: number;
  hasChildren: boolean;
  activityLevel: 'Active' | 'Moderate' | 'Sedentary';

  // Step 4: Pet Experience
  firstTimeOwner: boolean;
  previousPetDetails: string;
  reasonForAdopting: string;
  referralSource: string;

  // Step 5: Sign
  signature: string;
}

export interface DonationCampaign {
  id: string;
  title: string;
  subtitle: string;
  storySnippet: string;
  medicalReport?: string;
  goalAmount: number;
  raisedAmount: number;
  daysRemaining: number;
  image: string;
}

export interface RescueReport {
  id: string;
  animalType: 'Dog' | 'Cat' | 'Bird' | 'Other';
  condition: 'Injured' | 'Sick' | 'Abandoned Litter' | 'Trapped' | 'Hit by vehicle' | 'Other';
  location: string;
  landmark: string;
  pincode: string;
  reporterName: string;
  reporterWhatsApp: string;
  isEmergency: boolean;
  photoUrl?: string;
  status: 'Reported' | 'Dispatching' | 'On Scene' | 'Rescued' | 'At Shelter';
  submittedAt: string;
  assignedVolunteer?: string;
}

export interface FosterRecord {
  id: string;
  dogId: string;
  dogName: string;
  dogImage: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Active' | 'Completed';
  fosterName: string;
  phone: string;
  city: string;
  duration: string;
}

export interface VolunteerSignUp {
  id: string;
  name: string;
  city: string;
  phone: string;
  role: string;
  availability: string;
  hasVehicle: boolean;
  status: 'Applied' | 'Onboarded' | 'Inactive';
}

export interface EventItem {
  id: string;
  title: string;
  type: 'Adoption Camp' | 'Vaccination Drive' | 'Awareness Walk' | 'Fundraiser' | 'ABC Camp' | 'Dog Cafe Pop-up';
  date: string;
  time: string;
  city: string;
  venue: string;
  mapsUrl: string;
  description: string;
  image: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: 'T-shirts' | 'Tote bags' | 'Mugs' | 'Phone covers' | 'Bandanas' | 'Stickers' | 'Gifts';
  sizes?: string[];
  isCODSupported: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'Rescue News' | 'Adoption Tips' | 'Dog Care in India' | 'Policy & Animal Laws' | 'INDog Education';
  author: string;
  date: string;
  readTime: string;
  image: string;
  summary: string;
  content: string;
}

export interface UserProfile {
  phone: string;
  name: string;
  email?: string;
  city?: string;
  avatar?: string;
  avatarUrl?: string;
  registeredAt?: string;
  role?: 'General' | 'Admin';
  uid?: string;
}
