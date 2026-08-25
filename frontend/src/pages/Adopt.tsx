
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Share2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  MapPin, 
  Baby, 
  Search, 
  User, 
  Briefcase, 
  BookOpen, 
  AlertCircle,
  FileCheck,
  X,
  RotateCcw,
  Home as HomeIcon
} from 'lucide-react';
import { Dog, AdoptionApplication } from '@/src/types';
import { useAppContext } from '@/components/providers/AppContext';
import { useDogs } from '@/lib/hooks/useDogs';
import { useAdoptionMutations } from '@/lib/hooks/useAdoptions';
import InteractiveTiltCard from '@/components/ui/InteractiveTiltCard';
import Reveal from '@/components/ui/Reveal';

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
    main_image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    weight: '8 kg',
    rescueStory: 'Found nestled under a tea stall in Koramangala during heavy rains.'
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
    main_image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    weight: '16 kg',
    rescueStory: 'Rescued from a busy highway in Thane with a fractured leg.'
  }
];

export default function AdoptPage() {
  const { t } = useTranslation();
  const { 
    triggerAppletActionLoader, 
    favoriteDogs, 
    handleToggleFavorite,
    selectedDogForProfile,
    setSelectedDogForProfile
  } = useAppContext();

  const { submitApplication } = useAdoptionMutations();

  const { dogs: dbDogs, isLoading, error } = useDogs({ status: 'available' });
  
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const dogsList = (dbDogs && dbDogs.length > 0 ? dbDogs : LOCAL_INITIAL_DOGS).map((d: any) => ({
    ...d,
    image: d.cover_image_url || d.image || d.main_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    main_image_url: d.cover_image_url || d.main_image_url || d.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    city: d.city || d.location || 'Delhi Shelter',
    species: d.species || 'Dog',
    personalityTags: (d.personalityTags && d.personalityTags.length > 0) ? d.personalityTags : (d.flags && d.flags.length > 0 ? d.flags : ['Rescued', 'Medical Care', 'Needs Home']),
    lifeStory: d.story || d.lifeStory || d.description || 'Rescued street animal under sanctuary care, looking for a loving permanent family.',
    medicalBadges: d.medicalBadges || { vaccinated: true, neutered: true, dewormed: true, microchipped: true },
  }));

  const favorites = (favoriteDogs || []).map(d => d.id);

  const handleSaveDogToFavorites = (dogId: string) => {
    const dog = dogsList.find(d => d.id === dogId);
    if (dog) handleToggleFavorite(dog as any);
  };

  const handleSubmitApplication = async (payload: any) => {
    try {
      await submitApplication(payload);
      setSubmitStatus({
        type: 'success',
        message: "Your adoption application has been submitted successfully to Athia sanctuary!"
      });
      alert("Your adoption application has been submitted successfully to Athia sanctuary! Dynamic verification pending...");
    } catch (err) {
      console.error("Adoption submit error:", err);
      setSubmitStatus({
        type: 'error',
        message: "Error submitting application. Please try again."
      });
      alert("Error submitting application. Please try again.");
    }
  };

  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  useEffect(() => {
    if (selectedDogForProfile) {
      setSelectedDog(selectedDogForProfile);
    }
  }, [selectedDogForProfile]);

  const handleClearSelectedDog = () => {
    setSelectedDog(null);
    setSelectedDogForProfile(null);
  };

  // Filters State
  const [filterSpecies, setFilterSpecies] = useState<string>('All');
  const [filterBreed, setFilterBreed] = useState<string>('All');
  const [filterAge, setFilterAge] = useState<string>('All');
  const [filterSize, setFilterSize] = useState<string>('All');
  const [filterGender, setFilterGender] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterSpecialNeeds, setFilterSpecialNeeds] = useState<boolean>(false);
  const [filterGoodWithKids, setFilterGoodWithKids] = useState<boolean>(false);
  const [filterGoodWithPets, setFilterGoodWithPets] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Favorites logic
  const isFavorite = (dogId: string) => favorites.includes(dogId);

  // Sharing states
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareText, setShareText] = useState('');

  // Multi-step adoption wizard state
  const [isApplying, setIsApplying] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formValidationErrors, setFormValidationErrors] = useState<Record<string, string>>({});

  const [appForm, setAppForm] = useState({
    fullName: '',
    age: 25,
    idType: 'Aadhaar' as 'Aadhaar' | 'PAN',
    idNumber: '',
    phone: '',
    email: '',
    city: 'Mumbai',
    pincode: '',
    ownership: 'Own' as 'Own' | 'Renting',
    homeType: 'House' as 'House' | 'Apartment',
    outdoorSpace: 'Yes, secure yard' as 'Yes, secure yard' | 'Yes, open balcony' | 'No',
    landlordPermission: true,
    workingHours: '9 AM - 5 PM',
    dailyRoutine: 'Dog will be fed morning & night, walked twice.',
    householdMembersCount: 4,
    hasChildren: false,
    activityLevel: 'Moderate' as 'Active' | 'Moderate' | 'Sedentary',
    firstTimeOwner: true,
    previousPetDetails: '',
    reasonForAdopting: 'I want to give an orphaned street pup a warm life.',
    referralSource: 'Social Media',
    signature: ''
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) return null;

  // Filtering Logic
  const filteredDogs = dogsList.filter((dog: any) => {
    const dogSpecies = dog.species || 'Dog';
    if (filterSpecies !== 'All' && dogSpecies !== filterSpecies) return false;
    if (filterBreed !== 'All' && dog.breed !== filterBreed) return false;
    if (filterAge !== 'All' && dog.age !== filterAge) return false;
    if (filterSize !== 'All' && dog.size !== filterSize) return false;
    if (filterGender !== 'All' && dog.gender !== filterGender) return false;
    if (filterCity !== 'All' && dog.city !== filterCity) return false;
    if (filterSpecialNeeds && !dog.specialNeeds) return false;
    if (filterGoodWithKids && !dog.goodWithKids) return false;
    if (filterGoodWithPets && !dog.goodWithOtherPets) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = dog.name.toLowerCase().includes(q);
      const matchesTags = dog.personalityTags.some(t => t.toLowerCase().includes(q));
      const matchesCity = dog.city.toLowerCase().includes(q);
      const matchesBreed = dog.breed.toLowerCase().includes(q);
      const matchesSpecies = dogSpecies.toLowerCase().includes(q);
      if (!matchesName && !matchesTags && !matchesCity && !matchesBreed && !matchesSpecies) return false;
    }
    return true;
  });

  const handleShare = (dog: Dog, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/adopt?adoptId=${dog.id}` : '';
    const text = `Adopt ${dog.name} via NGO Athia! She is a ${dog.age} ${dog.breed} in ${dog.city}. Let's find her a lovely home! Shared Link: ${shareUrl}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareText(`Link copied to clipboard! Share it with friends on WhatsApp`);
    } else {
      setShareText(`WhatsApp Share text generated for ${dog.name}!`);
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 4000);
  };

  const getRadarPointsString = (radar?: Dog['personalityRadar']) => {
    const safeRadar = radar || {
      playful: 80,
      friendly: 90,
      calm: 75,
      energetic: 85,
      independent: 60,
      affectionate: 95
    };
    const centers = { x: 50, y: 50 };
    const radius = 40;
    const attributes = [
      safeRadar.playful ?? 80,
      safeRadar.friendly ?? 90,
      safeRadar.calm ?? 75,
      safeRadar.energetic ?? 85,
      safeRadar.independent ?? 60,
      safeRadar.affectionate ?? 95
    ];

    const points = attributes.map((val, idx) => {
      const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
      const factor = val / 100;
      const x = centers.x + radius * factor * Math.cos(angle);
      const y = centers.y + radius * factor * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return points.join(' ');
  };

  const handleNextStep = () => {
    const errors: Record<string, string> = {};
    if (formStep === 1) {
      if (!appForm.fullName.trim()) errors.fullName = "Full name is requested";
      if (!appForm.idNumber.trim()) errors.idNumber = `${appForm.idType} Card details are requested`;
      if (!appForm.phone || appForm.phone.length !== 10) errors.phone = "Provide active 10 digit WhatsApp number";
      if (!appForm.pincode || appForm.pincode.length !== 6) errors.pincode = "Verify 6 digit Indian pin code";
    } else if (formStep === 5) {
      if (!appForm.signature.trim()) errors.signature = "Please sign by typing your full legal name";
    }

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      return;
    }

    setFormValidationErrors({});
    triggerAppletActionLoader("Agle badha rahe hain...", "Ferrying application guidelines safely...", () => {
      setFormStep(prev => prev + 1);
    });
  };

  const handlePrevStep = () => {
    setFormStep(prev => prev - 1);
  };

  const handleFormFinishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.signature.trim()) {
      setFormValidationErrors({ signature: "Please sign contract by entering your name" });
      return;
    }

    if (!selectedDog) return;

    triggerAppletActionLoader("Athia team registers application...", "Submitting verification details to NGO panel...", () => {
      const applicationPayload: AdoptionApplication = {
        id: `app-${Date.now()}`,
        dogId: selectedDog.id,
        dogName: selectedDog.name,
        dogImage: selectedDog.image,
        status: 'In Review',
        submittedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        fullName: appForm.fullName,
        age: appForm.age,
        idType: appForm.idType,
        idNumber: appForm.idNumber,
        phone: appForm.phone,
        email: appForm.email,
        city: selectedDog.city,
        pincode: appForm.pincode,
        ownership: appForm.ownership,
        homeType: appForm.homeType,
        outdoorSpace: appForm.outdoorSpace,
        landlordPermission: appForm.landlordPermission,
        workingHours: appForm.workingHours,
        dailyRoutine: appForm.dailyRoutine,
        householdMembersCount: appForm.householdMembersCount,
        hasChildren: appForm.hasChildren,
        activityLevel: appForm.activityLevel,
        firstTimeOwner: appForm.firstTimeOwner,
        previousPetDetails: appForm.previousPetDetails,
        reasonForAdopting: appForm.reasonForAdopting,
        referralSource: appForm.referralSource,
        signature: appForm.signature
      };

      handleSubmitApplication(applicationPayload);
      setIsApplying(false);
      handleClearSelectedDog();
    });
  };

  return (
    <div id="athia-adoption-module" className="max-w-7xl mx-auto px-4 py-16 relative space-y-8 font-sans">
      
      {/* Toast Alert on Share */}
      {showShareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-deep border-accent border text-white p-4 rounded-xl shadow-warm z-50 text-xs md:text-sm flex items-center space-x-2 animate-bounce max-w-sm">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{shareText}</span>
        </div>
      )}

      {/* RENDER CASE A: SINGLE DOG DETAIL VIEW */}
      {selectedDog ? (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-orange-50 shadow-warm-sm">
            <button 
              id="back-to-listing"
              onClick={handleClearSelectedDog}
              className="flex items-center space-x-2 text-primary font-bold text-sm bg-orange-50 px-4 py-2 rounded-xl cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back to Stray Listing</span>
            </button>
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => handleShare(selectedDog, e)}
                className="p-2.5 rounded-xl border border-gray-250 text-gray-600 hover:text-primary hover:bg-orange-50 transition cursor-pointer"
              >
                <Share2 size={16} />
              </button>
              <button 
                onClick={() => handleSaveDogToFavorites(selectedDog.id)}
                className={`p-2.5 rounded-xl border cursor-pointer ${isFavorite(selectedDog.id) ? 'bg-orange-50 border-orange-100 text-primary' : 'border-gray-255 text-gray-400'}`}
              >
                <Heart size={16} fill={isFavorite(selectedDog.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {!isApplying ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              {/* Profile Left Sidebar with Gallery + Radar */}
              <div className="lg:col-span-5 space-y-6">
                {/* Dog Hero Photo */}
                <div className="relative aspect-square md:aspect-4/3 rounded-3xl overflow-hidden shadow-warm border-4 border-white">
                  <img 
                    src={selectedDog.image} 
                    alt={selectedDog.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 left-4 bg-deep/80 text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5">
                    <MapPin size={12} className="text-secondary" />
                    <span>{selectedDog.city} Shelter</span>
                  </div>
                </div>

                {/* Personality Radar Map SVG */}
                <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-4">
                  <h4 className="text-lg font-bold font-baloo text-deep border-b border-orange-50 pb-2">Temperament Metric</h4>
                  <div className="flex justify-center py-2">
                    <svg viewBox="0 0 100 100" className="w-56 h-56">
                      <circle cx="50" cy="50" r="40" className="fill-none stroke-gray-100" strokeWidth="1" />
                      <circle cx="50" cy="50" r="30" className="fill-none stroke-gray-100" strokeWidth="1" />
                      <circle cx="50" cy="50" r="20" className="fill-none stroke-gray-100" strokeWidth="1" />
                      <circle cx="50" cy="50" r="10" className="fill-none stroke-gray-100" strokeWidth="1" />
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                        const x = 50 + 40 * Math.cos(angle);
                        const y = 50 + 40 * Math.sin(angle);
                        return <line key={idx} x1="50" y1="50" x2={x} y2={y} className="stroke-gray-100" strokeWidth="1" />;
                      })}
                      <polygon 
                        points={getRadarPointsString(selectedDog.personalityRadar)} 
                        className="fill-primary/25 stroke-primary" 
                        strokeWidth="1.5" 
                      />
                      {[
                        { text: 'Playful', x: 50, y: 7 },
                        { text: 'Friendly', x: 88, y: 30 },
                        { text: 'Calm', x: 88, y: 72 },
                        { text: 'Energetic', x: 50, y: 95 },
                        { text: 'Independent', x: 12, y: 72 },
                        { text: 'Affectionate', x: 12, y: 30 }
                      ].map((lbl, idx) => (
                        <text 
                          key={idx} 
                          x={lbl.x} 
                          y={lbl.y} 
                          textAnchor="middle" 
                          className="font-mono text-[7px] font-semibold text-gray-500 fill-current"
                        >
                          {lbl.text}
                        </text>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Profile Details Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-orange-50 shadow-warm space-y-6">
                  <div className="flex flex-wrap justify-between items-baseline gap-4">
                    <div className="space-y-1">
                      <h2 className="text-4xl font-extrabold font-baloo text-deep">{selectedDog.name}</h2>
                      <p className="text-sm text-gray-500 font-mono italic">{selectedDog.breed} mix • {selectedDog.age} • {selectedDog.gender}</p>
                    </div>
                    <div className="bg-emerald-50 border border-green-200 text-accent font-bold px-4 py-1.5 rounded-full text-xs">
                      STRAY REHAB COMPLETED
                    </div>
                  </div>

                  {/* Medical metrics badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="bg-cream p-2.5 rounded-xl border border-orange-50 text-center">
                      <p className="text-[10px] font-bold text-gray-600 uppercase mt-0.5">Vaccinated</p>
                      <span className="text-[10px] text-accent font-semibold">{selectedDog.medicalBadges.vaccinated ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="bg-cream p-2.5 rounded-xl border border-orange-50 text-center">
                      <p className="text-[10px] font-bold text-gray-600 uppercase mt-0.5">Neutered</p>
                      <span className="text-[10px] text-accent font-semibold">{selectedDog.medicalBadges.neutered ? 'Yes (Spayed)' : 'No'}</span>
                    </div>
                    <div className="bg-cream p-2.5 rounded-xl border border-orange-50 text-center">
                      <p className="text-[10px] font-bold text-gray-600 uppercase mt-0.5">Dewormed</p>
                      <span className="text-[10px] text-accent font-semibold">{selectedDog.medicalBadges.dewormed ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="bg-cream p-2.5 rounded-xl border border-orange-50 text-center">
                      <p className="text-[10px] font-bold text-gray-600 uppercase mt-0.5">Microchipped</p>
                      <span className="text-[10px] text-accent font-semibold">{selectedDog.medicalBadges.microchipped ? 'Aadhaar Pet ID' : 'Pending'}</span>
                    </div>
                  </div>

                  {/* Emotional "Day in My Life" */}
                  <div className="space-y-3 font-sans">
                    <h3 className="text-xl font-bold font-baloo text-primary flex items-center space-x-1.5">
                      <span>My Little Diary (A Day in my Life...)</span>
                    </h3>
                    <p className="text-gray-700 text-sm italic bg-[#FFFBF7] p-5 rounded-2xl border-l-4 border-[#E8572A] leading-relaxed">
                      "{selectedDog.lifeStory}"
                    </p>
                  </div>

                  {/* Rescue History */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase font-mono">My Rescue Chronicle</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">{selectedDog.rescueStory}</p>
                  </div>

                  {/* Adoption Requirements */}
                  <div className="p-5 bg-orange-100/40 rounded-2xl border border-orange-100 text-xs space-y-3 font-sans">
                    <p className="font-bold text-deep flex items-center"><AlertCircle size={14} className="text-primary mr-1.5" /> NGO ADOPTION MANDATES (India Framework):</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                      <li className="flex items-center"><Check size={12} className="text-accent mr-1.5 shrink-0" /> Must be 21+ years with Aadhaar Card ID</li>
                      <li className="flex items-center"><Check size={12} className="text-accent mr-1.5 shrink-0" /> No Objection Letter from landlord if renting</li>
                      <li className="flex items-center"><Check size={12} className="text-accent mr-1.5 shrink-0" /> Local physical home-visit strictly mandatory</li>
                      <li className="flex items-center"><Check size={12} className="text-accent mr-1.5 shrink-0" /> Adoption Fee: ₹500 - ₹2,000 max (covers pup meds)</li>
                    </ul>
                  </div>

                  {/* Main Action Call CTA */}
                  <div className="pt-2">
                    <button 
                      id="apply-to-adopt-btn"
                      onClick={() => {
                        setIsApplying(true);
                        setFormStep(1);
                      }}
                      className="w-full bg-gradient-to-r from-primary to-orange-450 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 text-base shadow-warm cursor-pointer hover:shadow-warm-lg"
                    >
                      <span className="font-baloo text-lg font-bold">Apply to Adopt {selectedDog.name}</span>
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-2">Submission will list progress inside your User Dashboard instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MULTI-STEP ADOPTION FORM (5 STEPS) */
            <div className="bg-white rounded-3xl border border-orange-50 shadow-warm overflow-hidden text-left">
              <div className="bg-deep p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold font-baloo text-secondary">Adoption Application Wizard</h3>
                  <p className="text-xs text-gray-300 font-mono uppercase mt-0.5 font-semibold">APPLYING FOR: <span className="text-white font-bold">{selectedDog.name}</span></p>
                </div>
                <button 
                  onClick={() => setIsApplying(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-gray-300 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progress Bar steps */}
              <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between font-sans">
                {[
                  { num: 1, label: "Personal" },
                  { num: 2, label: "Home" },
                  { num: 3, label: "Lifestyle" },
                  { num: 4, label: "History" },
                  { num: 5, label: "Contract" }
                ].map((st) => (
                  <div key={st.num} className="flex-1 flex items-center">
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        formStep === st.num ? 'bg-primary text-white' : formStep > st.num ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {formStep > st.num ? <Check size={12} /> : st.num}
                      </div>
                      <span className={`text-[10px] md:text-xs font-bold ${formStep >= st.num ? 'text-deep' : 'text-gray-400'}`}>{st.label}</span>
                    </div>
                    {st.num < 5 && <div className={`flex-1 mx-2 h-0.5 ${formStep > st.num ? 'bg-accent' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>

              <div className="p-8 max-w-2xl mx-auto space-y-6">
                {/* STEP 1: ABOUT YOU */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="font-baloo text-xl font-bold text-deep flex items-center space-x-2">
                      <User size={18} className="text-primary" />
                      <span>About You & Registered Identification</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Full Legal Name *</label>
                        <input 
                          type="text" 
                          required
                          value={appForm.fullName}
                          onChange={e => setAppForm(prev => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Your official Aadhaar name"
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                        {formValidationErrors.fullName && <p className="text-[10px] text-red-500">{formValidationErrors.fullName}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Your Current Age *</label>
                        <input 
                          type="number" 
                          min={21}
                          max={99}
                          value={appForm.age}
                          onChange={e => setAppForm(prev => ({ ...prev, age: parseInt(e.target.value) || 21 }))}
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Government ID Document Type *</label>
                        <select 
                          value={appForm.idType}
                          onChange={e => setAppForm(prev => ({ ...prev, idType: e.target.value as 'Aadhaar' | 'PAN' }))}
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="Aadhaar">Aadhaar Card (12 digits)</option>
                          <option value="PAN">PAN Card (Alphanumeric)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">{appForm.idType} Card Details *</label>
                        <input 
                          type="text" 
                          required
                          maxLength={16}
                          value={appForm.idNumber}
                          onChange={e => setAppForm(prev => ({ ...prev, idNumber: e.target.value }))}
                          placeholder={appForm.idType === 'Aadhaar' ? 'xxxx xxxx xxxx' : 'ABCDE1234F'}
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none font-mono"
                        />
                        {formValidationErrors.idNumber && <p className="text-[10px] text-red-500">{formValidationErrors.idNumber}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">WHATSAPP NUMBER (INDIAN PREFIX) *</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">+91</span>
                          <input 
                            type="tel" 
                            maxLength={10}
                            required
                            placeholder="Enter 10-digit Phone" 
                            value={appForm.phone}
                            onChange={e => setAppForm(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            className="w-full bg-cream border border-orange-50 rounded-lg py-2.5 pl-12 pr-4 text-sm focus:border-primary focus:outline-none font-mono"
                          />
                        </div>
                        {formValidationErrors.phone && <p className="text-[10px] text-red-500">{formValidationErrors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Active Email Address (Optional)</label>
                        <input 
                          type="email" 
                          value={appForm.email}
                          onChange={e => setAppForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="name@gmail.com"
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">NGO Active Cities Dropout</label>
                        <input 
                          type="text" 
                          readOnly
                          value={selectedDog.city}
                          className="w-full bg-[#FAFAFA] border border-gray-200 text-gray-500 rounded-lg p-2.5 text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Local City Pincode *</label>
                        <input 
                          type="text" 
                          maxLength={6}
                          required
                          placeholder="e.g. 400012"
                          value={appForm.pincode}
                          onChange={e => setAppForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none font-mono"
                        />
                        {formValidationErrors.pincode && <p className="text-[10px] text-red-500">{formValidationErrors.pincode}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: YOUR HOME */}
                {formStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="font-baloo text-xl font-bold text-deep flex items-center space-x-2">
                      <HomeIcon size={18} className="text-primary animate-bounce-short" />
                      <span>About Your Home Safety Parameters</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Ownership Status *</label>
                        <div className="flex gap-4 pt-1">
                          {['Own', 'Renting'].map((o) => (
                            <label key={o} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                              <input 
                                type="radio" 
                                name="ownership"
                                checked={appForm.ownership === o}
                                onChange={() => setAppForm(prev => ({ ...prev, ownership: o as any }))}
                                className="accent-primary" 
                              />
                              <span>{o} Home</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Accommodation Type *</label>
                        <div className="flex gap-4 pt-1">
                          {['House', 'Apartment'].map((ht) => (
                            <label key={ht} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                              <input 
                                type="radio" 
                                name="homeType"
                                checked={appForm.homeType === ht}
                                onChange={() => setAppForm(prev => ({ ...prev, homeType: ht as any }))}
                                className="accent-primary" 
                              />
                              <span>{ht}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">Secure Balcony / Yard Outdoor Space Status *</label>
                      <select 
                        value={appForm.outdoorSpace}
                        onChange={e => setAppForm(prev => ({ ...prev, outdoorSpace: e.target.value as any }))}
                        className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="Yes, secure yard">Yes, locked garden / secure yard area</option>
                        <option value="Yes, open balcony">Yes, standard balconic balcony (fully grilled)</option>
                        <option value="No">No secure yard / open terrace area</option>
                      </select>
                    </div>

                    <div className="space-y-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-xs">
                      <p className="text-gray-600">Many Indian highrise RWAs raise queries over canine pets. Landlord consent certificate is strongly recommended to protect adoption stability.</p>
                      <label className="flex items-start space-x-2 cursor-pointer text-xs font-semibold text-deep pt-1">
                        <input 
                          type="checkbox" 
                          checked={appForm.landlordPermission}
                          onChange={e => setAppForm(prev => ({ ...prev, landlordPermission: e.target.checked }))}
                          className="mr-1 mt-0.5 accent-primary" 
                        />
                        <span>I confirm that no family members, landlords, or community bylaws reject keeping an INDog of medium size.</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* STEP 3: LIFESTYLE */}
                {formStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-baloo text-xl font-bold text-deep flex items-center space-x-2">
                      <Briefcase size={18} className="text-primary" />
                      <span>About Your Work & Household Lifestyle</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Daily Working Hours Schedule *</label>
                        <input 
                          type="text" 
                          value={appForm.workingHours}
                          onChange={e => setAppForm(prev => ({ ...prev, workingHours: e.target.value }))}
                          placeholder="e.g. 9 AM - 5 PM WFH"
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Active Family Members in House *</label>
                        <input 
                          type="number" 
                          min={1}
                          value={appForm.householdMembersCount}
                          onChange={e => setAppForm(prev => ({ ...prev, householdMembersCount: parseInt(e.target.value) || 1 }))}
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 flex flex-col justify-center text-left">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Do you have children or grandparents resident?</label>
                        <label className="flex items-center space-x-2.5 text-sm font-semibold text-gray-700 cursor-pointer pt-1.5">
                          <input 
                            type="checkbox" 
                            checked={appForm.hasChildren}
                            onChange={e => setAppForm(prev => ({ ...prev, hasChildren: e.target.checked }))}
                            className="accent-primary" 
                          />
                          <span>Yes, small resident kids under 12 years old</span>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">What is your general Activity level?</label>
                        <select 
                          value={appForm.activityLevel}
                          onChange={e => setAppForm(prev => ({ ...prev, activityLevel: e.target.value as any }))}
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        >
                          <option value="Active">Highly Active (Love treks, running, 5km walks)</option>
                          <option value="Moderate">Moderate (Average daily strolls around locality)</option>
                          <option value="Sedentary">Sedentary (Mostly relaxed, indoor focused)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">Describe daily dog-care allocation plan *</label>
                      <textarea 
                        rows={3}
                        value={appForm.dailyRoutine}
                        onChange={e => setAppForm(prev => ({ ...prev, dailyRoutine: e.target.value }))}
                        className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: PET KNOWLEDGE */}
                {formStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="font-baloo text-xl font-bold text-deep flex items-center space-x-2">
                      <BookOpen size={18} className="text-primary" />
                      <span>About Canine Ownership Experiences</span>
                    </h3>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">First-Time Dog Parent?</label>
                      <div className="flex flex-col gap-2 pt-2">
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="fto"
                            checked={appForm.firstTimeOwner}
                            onChange={() => setAppForm(prev => ({ ...prev, firstTimeOwner: true }))}
                            className="accent-primary"
                          />
                          <span>Yes, this will be our family's very first furry member</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="fto"
                            checked={!appForm.firstTimeOwner}
                            onChange={() => setAppForm(prev => ({ ...prev, firstTimeOwner: false }))}
                            className="accent-primary"
                          />
                          <span>No, have active/previous pet experiences</span>
                        </label>
                      </div>
                    </div>

                    {!appForm.firstTimeOwner && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase block">Provide previous/active canine profiles (Breed, lifespan, etc.) *</label>
                        <textarea 
                          rows={2}
                          required={!appForm.firstTimeOwner}
                          value={appForm.previousPetDetails}
                          onChange={e => setAppForm(prev => ({ ...prev, previousPetDetails: e.target.value }))}
                          placeholder="e.g. We loved an Indie mix dog for 12 beautiful years."
                          className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">Why do you wish to adopt this specific stray? *</label>
                      <textarea 
                        rows={3}
                        value={appForm.reasonForAdopting}
                        onChange={e => setAppForm(prev => ({ ...prev, reasonForAdopting: e.target.value }))}
                        className="w-full bg-cream border border-orange-50 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: CONTRACT PREVIEW SIGNING */}
                {formStep === 5 && (
                  <div className="space-y-4 font-sans text-left">
                    <h3 className="font-baloo text-xl font-bold text-deep flex items-center space-x-2 border-b border-orange-50 pb-2">
                      <FileCheck size={18} className="text-primary" />
                      <span>Legal Agreement & Sign Registry</span>
                    </h3>

                    <div className="bg-slate-50 p-5 rounded-2xl text-[11px] text-gray-700 space-y-2 border border-gray-200 shadow-inner h-48 overflow-y-auto leading-relaxed">
                      <p className="font-bold text-deep text-center text-xs uppercase mb-1">ATHIA CANINE ADOPTION CONTRACT DEED</p>
                      <p>1. **COMPREHENSIVE DEVOTION:** The Adopter covenants to keep the adopted dog in a secure environment. He/she shall not abandon, sell, or render the dog for research purposes under any emergency.</p>
                      <p>2. **STERILIZATION MANDATES:** In case the adoptive pup is small, Adopter agrees to complete sterilization via designated Athia vet partners when the dog touches 6 months old.</p>
                      <p>3. **VACCINES COMPLIANCE:** Adopter covenants to secure comprehensive annual DHPPi & Anti-Rabies vaccine buffers. Feed logs should compile nutritious Indian dog diet guides.</p>
                      <p>4. **ATHIA MONITORING INDEX:** Athia maintains privileges to coordinate soft checkup reviews and schedule physical or photographic home updates over the initial 12 calendar months.</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">Covenant Digital Signature *</label>
                      <input 
                        type="text" 
                        required
                        value={appForm.signature}
                        onChange={e => setAppForm(prev => ({ ...prev, signature: e.target.value }))}
                        placeholder="Type your Full Name to digitally authorize"
                        className="w-full bg-cream border border-orange-50 rounded-lg p-3 text-sm focus:border-primary focus:outline-none font-tiro uppercase tracking-wider font-semibold border-2 border-dashed border-primary"
                      />
                      {formValidationErrors.signature && <p className="text-[10px] text-red-500">{formValidationErrors.signature}</p>}
                      <p className="text-[10px] text-gray-500 italic pt-1">Typing your legal credentials represents a valid binding contract. A physical copy is generated during the physical shelter hand-over.</p>
                    </div>
                  </div>
                )}

                {/* Wizard navigation buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-100 font-sans">
                  {formStep > 1 ? (
                    <button 
                      type="button" 
                      onClick={handlePrevStep}
                      className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {formStep < 5 ? (
                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl flex items-center space-x-1 hover:shadow-warm transition cursor-pointer"
                    >
                      <span>Forward Continuation</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleFormFinishSubmit}
                      className="bg-accent hover:bg-green-700 text-white text-xs font-bold px-8 py-3.5 rounded-xl uppercase tracking-wider flex items-center space-x-1 shadow-md hover:-translate-y-0.5 transition cursor-pointer"
                    >
                      <span>Transmit Application</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* RENDER CASE B: LIST OF DOGS */
        <div className="space-y-8">
          <div className="space-y-2 text-center">
            <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono font-bold">{t('nav.adopt')}</span>
            <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">{t('adopt.title')}</h1>
            <p className="text-gray-600 max-w-xl mx-auto text-sm font-sans leading-relaxed">
              {t('adopt.subtitle')}
            </p>
          </div>

          {/* Quick Species Quick Selector Tab bar */}
          <div className="flex flex-wrap gap-2 justify-center pb-2">
            {[
              { id: 'All', label: t('adopt.filterAll') },
              { id: 'Dog', label: t('adopt.filterDogs') },
              { id: 'Cat', label: t('adopt.filterCats') },
              { id: 'Cow', label: 'Cows' },
              { id: 'Hamster', label: 'Hamsters' },
              { id: 'Rabbit', label: 'Rabbits' },
              { id: 'Other', label: 'Others' },
            ].map(spec => (
              <button
                key={spec.id}
                onClick={() => {
                  triggerAppletActionLoader(`Switching to ${spec.label}...`, `Filtering resident ${spec.label.toLowerCase()}...`, () => {
                    setFilterSpecies(spec.id);
                  });
                }}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center space-x-2 border shadow-warm-sm cursor-pointer ${
                  filterSpecies === spec.id
                    ? 'bg-primary text-white border-primary scale-105 shadow-md'
                    : 'bg-white text-gray-600 border-gray-150 hover:bg-orange-50/50 hover:border-orange-100'
                }`}
              >
                <span>{spec.label}</span>
                <span className="bg-orange-50/25 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {dogsList.filter((d: any) => {
                    const dSpecies = d.species || 'Dog';
                    return spec.id === 'All' ? true : dSpecies === spec.id;
                  }).length}
                </span>
              </button>
            ))}
          </div>

          {/* Sticky search/filter panel */}
          <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={t('adopt.searchPlaceholder')} 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-cream border border-orange-50 rounded-xl py-3 pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-2 items-center">
                <button 
                  onClick={() => setFilterSpecialNeeds(prev => !prev)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition duration-200 flex items-center space-x-1.5 cursor-pointer ${
                    filterSpecialNeeds ? 'bg-orange-50 text-primary border-primary' : 'bg-white text-gray-500 border-gray-220 hover:bg-cream'
                  }`}
                >
                  <span>{t('adopt.medicalNeeds')}</span>
                </button>

                <button 
                  onClick={() => setFilterGoodWithKids(prev => !prev)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition duration-200 flex items-center space-x-1.5 cursor-pointer ${
                    filterGoodWithKids ? 'bg-orange-50 text-primary border-primary' : 'bg-white text-gray-500 border-gray-220 hover:bg-cream'
                  }`}
                >
                  <Baby size={14} />
                  <span>Good with Kids</span>
                </button>

                <button 
                  onClick={() => setFilterGoodWithPets(prev => !prev)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition duration-200 flex items-center space-x-1.5 cursor-pointer ${
                    filterGoodWithPets ? 'bg-orange-50 text-primary border-primary' : 'bg-white text-gray-500 border-gray-220 hover:bg-cream'
                  }`}
                >
                  <span>Friendly with Pets</span>
                </button>
              </div>
            </div>

            {/* Grid dropdown selects */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-orange-50 pt-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Breed / Sub-type</label>
                <select 
                  value={filterBreed}
                  onChange={e => setFilterBreed(e.target.value)}
                  className="w-full bg-orange-100/30 border border-orange-100 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="All">All Breeds</option>
                  {Array.from(new Set(dogsList
                    .filter((d: any) => filterSpecies === 'All' || (d.species || 'Dog') === filterSpecies)
                    .map((d: any) => d.breed)
                  )).map(breedName => (
                    <option key={breedName} value={breedName}>{breedName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Animal Age Group</label>
                <select 
                  value={filterAge}
                  onChange={e => setFilterAge(e.target.value)}
                  className="w-full bg-orange-100/30 border border-orange-100 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="All">All Ages</option>
                  <option value="Puppy">Baby (Kitten, Puppy, Calf)</option>
                  <option value="Young">Young / Juvenile</option>
                  <option value="Adult">Adult / Fully Grown</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Animal Size</label>
                <select 
                  value={filterSize}
                  onChange={e => setFilterSize(e.target.value)}
                  className="w-full bg-orange-100/30 border border-orange-100 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="All">All Sizes</option>
                  <option value="Small">Small (&lt; 10kg)</option>
                  <option value="Medium">Medium (10 - 30kg)</option>
                  <option value="Large">Large (&gt; 30kg)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gender Index</label>
                <select 
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value)}
                  className="w-full bg-orange-100/30 border border-orange-100 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Athia Active City</label>
                <select 
                  value={filterCity}
                  onChange={e => setFilterCity(e.target.value)}
                  className="w-full bg-orange-100/30 border border-orange-100 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="All">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Pune">Pune</option>
                  <option value="Thane">Thane</option>
                </select>
              </div>
            </div>

            {/* Clear filters trigger */}
            {(filterBreed !== 'All' || filterAge !== 'All' || filterSize !== 'All' || filterGender !== 'All' || filterCity !== 'All' || filterSpecialNeeds || filterGoodWithKids || filterGoodWithPets || searchQuery) && (
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => {
                    setFilterBreed('All');
                    setFilterAge('All');
                    setFilterSize('All');
                    setFilterGender('All');
                    setFilterCity('All');
                    setFilterSpecialNeeds(false);
                    setFilterGoodWithKids(false);
                    setFilterGoodWithPets(false);
                    setSearchQuery('');
                  }}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset all filter states</span>
                </button>
              </div>
            )}
          </div>

          {/* Masonry cards listing */}
          {filteredDogs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left font-sans">
              {filteredDogs.map((dog: any, idx: number) => (
                <Reveal key={dog.id} direction="up" staggerIndex={idx} className="h-full">
                  <div 
                    onClick={() => {
                      setSelectedDog(dog);
                    }}
                    className="bg-white rounded-3xl overflow-hidden border border-orange-50 shadow-warm hover:shadow-warm-lg hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between group cursor-pointer h-full"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img 
                        src={dog.image} 
                        alt={dog.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      <button 
                        onClick={(e) => handleShare(dog, e)}
                        className="absolute top-3 left-3 bg-white/95 backdrop-blur border border-orange-50/50 p-2 rounded-xl text-gray-500 hover:text-primary shadow-sm cursor-pointer"
                      >
                        <Share2 size={13} />
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveDogToFavorites(dog.id);
                        }}
                        className="absolute top-3 right-3 bg-white/95 backdrop-blur border border-orange-50/50 p-2 rounded-xl shadow-sm transition hover:scale-110 cursor-pointer"
                        style={{ color: isFavorite(dog.id) ? '#E8572A' : '#9CA3AF' }}
                      >
                        <Heart size={13} fill={isFavorite(dog.id) ? 'currentColor' : 'none'} />
                      </button>

                      <div className="absolute bottom-3 left-3 bg-deep/75 backdrop-blur text-white font-mono text-[9px] px-2 py-0.5 rounded flex items-center space-x-1 shadow-sm">
                        <MapPin size={10} className="text-secondary" />
                        <span>{dog.city}</span>
                      </div>

                      {dog.specialNeeds && (
                        <span className="absolute bottom-3 right-3 bg-yellow-400 text-deep font-bold text-[8px] px-2 py-0.5 rounded-full shadow-sm font-sans">
                          SP. NEEDS
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-baloo font-bold text-xl text-deep leading-none">{dog.name}</h3>
                          <span className="text-[10px] text-[#2E8B57] bg-green-50 font-bold px-1.5 py-0.5 rounded font-sans">Active</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono italic mt-0.5">{dog.breed} • {dog.species || 'Dog'} • {dog.age}</p>
                        
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {dog.personalityTags.slice(0, 2).map((tag: string, i: number) => (
                            <span key={i} className="text-[9px] font-bold bg-[#FFF9F4] text-primary border border-orange-100/50 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">
                        {dog.lifeStory}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-semibold text-primary">
                        <span>Introduce Me</span>
                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-300 py-16 space-y-4 max-w-sm mx-auto font-sans">
              <Search size={36} className="text-gray-300 mx-auto mb-2" />
              <h3 className="font-baloo text-xl font-bold text-deep">No Animals Match Your Filters</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Try widening your canine age brackets, checking surrounding Indian metropolitan cities, or resetting checkboxes.
              </p>
              <button 
                onClick={() => {
                  setFilterBreed('All');
                  setFilterAge('All');
                  setFilterSize('All');
                  setFilterGender('All');
                  setFilterCity('All');
                  setFilterSpecialNeeds(false);
                  setFilterGoodWithKids(false);
                  setFilterGoodWithPets(false);
                  setSearchQuery('');
                }}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
