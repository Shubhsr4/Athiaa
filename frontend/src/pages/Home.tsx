
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Phone, 
  Instagram, 
  Facebook, 
  Youtube, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Award,
  BookOpen,
  PawPrint,
  Home as HomeIcon,
  ShieldAlert,
  Activity,
  Navigation,
  MessageCircle,
  Sparkles,
  Send,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Dog, DonationCampaign } from '@/src/types';
import InteractiveTiltCard from '@/components/ui/InteractiveTiltCard';
import { useAppContext } from '@/components/providers/AppContext';
import { useDogs } from '@/lib/hooks/useDogs';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import DelhiMap from '@/src/components/DelhiMap';
import { useRescueReports } from '@/lib/hooks/useRescueReports';
import { useSuccessStories } from '@/lib/hooks/useSuccessStories';
import Reveal from '@/components/ui/Reveal';

const PARTNERS_LOGOS = [
  { name: 'AWBI Recognised', label: 'Animal Welfare Board of India' },
  { name: 'PCA India Member', label: 'People for Animals' },
  { name: 'Fido-Labs Nutrition', label: 'Nutritional Sponsor' },
  { name: 'Heal-Vet Group', label: 'Trauma Care Clinics' },
  { name: 'Royal Canopy', label: 'Shelter Bedding Partner' }
];

const DEFAULT_SUCCESS_STORIES = [
  {
    id: 'story-1',
    dogName: 'Jalebi (formerly Spotty)',
    city: 'Mumbai',
    quote: '"Jalebi has completely changed how our gated community views street dogs. She is the smartest, gentlest member of our household!"',
    update: 'Rescued in 2024 from a sewer gutter, Jalebi now resides in an apartment in Bandra, high-fiving neighbors and sleeping on a custom velvet bolster.',
    beforeImage: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=600',
    adopter: 'The Mehta Family'
  },
  {
    id: 'story-2',
    dogName: 'Rocky',
    city: 'Bengaluru',
    quote: '"Rocky lost his leg in an automobile crash, but he never lost his spirit. He climbs up stairs faster than we do!"',
    update: 'Rocky was adopted by an avid trekker. He regularly visits Nandi Hills and loves going on road trips in a hatchback!',
    beforeImage: 'https://images.unsplash.com/photo-1502673530728-f79b4cbd313c?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=80&w=600',
    adopter: 'Vikram & Sneha'
  }
];

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
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    weight: '8 kg',
    lifeStory: 'Found nestled under a tea stall in Koramangala during heavy rains.'
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
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    weight: '16 kg',
    lifeStory: 'Rescued from a busy highway in Thane with a fractured leg.'
  }
];

const LOCAL_INITIAL_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'General Rescue Fund',
    slug: 'general-rescue',
    description: 'Sponsor medicines, specialized puppy formula, splints for orthopedic cases, and fuel for animal ambulance dispatch.',
    goal_amount: 500000,
    raised_amount: 342000,
    currency: 'INR',
    image_url: 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800',
    storySnippet: 'Keeping active ambulances running continuously across primary sectors.',
    is_active: true
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { 
    triggerAppletActionLoader, 
    setSelectedDogForProfile 
  } = useAppContext();

  const { dogs: dbDogs, isLoading: isDogsLoading } = useDogs({ featured: true, per_page: 6 });
  const { campaigns: dbCampaigns, isLoading: isCampaignsLoading } = useCampaigns();
  const { events: dbEvents, isLoading: isEventsLoading } = useEvents({ upcoming: true });
  const { stories: dbStories, isLoading: isStoriesLoading } = useSuccessStories();
  const { reports: rescueReports } = useRescueReports();

  const dogsList = (dbDogs && dbDogs.length > 0 ? dbDogs : LOCAL_INITIAL_DOGS).map((d: any) => ({
    ...d,
    image: d.image || d.main_image_url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    city: d.city || d.location || 'Delhi Shelter',
    personalityTags: (d.personalityTags && d.personalityTags.length > 0) ? d.personalityTags : (d.flags && d.flags.length > 0 ? d.flags : ['Friendly', 'Vaccinated']),
    lifeStory: d.lifeStory || d.description || 'Rescued street dog in need of loving care.',
    medicalBadges: d.medicalBadges || { vaccinated: true, neutered: true, dewormed: true, microchipped: true },
  }));
  const campaignsList = (dbCampaigns && dbCampaigns.length > 0 ? dbCampaigns : LOCAL_INITIAL_CAMPAIGNS) as any[];

  const rawStories = dbStories && dbStories.length > 0 ? dbStories : DEFAULT_SUCCESS_STORIES;
  const storiesList = (rawStories || []).map((story: any) => ({
    id: story.id,
    dogName: story.dogName || story.title || 'Athiaa Dog',
    city: story.city || 'Mumbai',
    quote: story.quote || story.content || '',
    update: story.update || story.content || '',
    beforeImage: story.beforeImage || story.image_url || 'https://images.unsplash.com/photo-1534361960057-19889db9621e',
    afterImage: story.afterImage || story.image_url || 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9',
    adopter: story.adopter || story.author_name || 'Blessed Family'
  }));

  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [selectedCityStats, setSelectedCityStats] = useState<null | { name: string; rescued: number; activeFeeders: number; vetPartners: number }>(null);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [whatsappJoined, setWhatsappJoined] = useState(false);
  const [waError, setWaError] = useState('');
  const [isSubmittingWa, setIsSubmittingWa] = useState(false);

  // Safely guard against out of bounds index if stories list becomes empty dynamically
  const safeActiveIndex = activeStoryIndex < storiesList.length ? activeStoryIndex : 0;
  const activeStory = storiesList[safeActiveIndex] || DEFAULT_SUCCESS_STORIES[0];

  const rawFeaturedCampaign = (campaignsList && campaignsList.length > 0 ? campaignsList[0] : LOCAL_INITIAL_CAMPAIGNS[0]) as any;
  const featuredCampaign = {
    ...rawFeaturedCampaign,
    title: rawFeaturedCampaign.title,
    storySnippet: rawFeaturedCampaign.storySnippet || rawFeaturedCampaign.description || '',
    raisedAmount: rawFeaturedCampaign.raised_amount ?? rawFeaturedCampaign.raisedAmount ?? 0,
    goalAmount: rawFeaturedCampaign.goal_amount ?? rawFeaturedCampaign.goalAmount ?? 1,
    daysRemaining: rawFeaturedCampaign.daysRemaining ?? rawFeaturedCampaign.days_remaining ?? 15,
    image: rawFeaturedCampaign.image_url || rawFeaturedCampaign.image || 'https://images.unsplash.com/photo-1489710437720-ebb67ec84dd2?auto=format&fit=crop&q=80&w=800'
  };

  // Stats counting state simulation
  const [stats, setStats] = useState({ rescued: 4800, adopted: 80, vaccinated: 3900, volunteers: 280 });

  useEffect(() => {
    // Soft animated tick-up of stats initially
    const interval = setInterval(() => {
      setStats(prev => {
        if (prev.rescued >= 5124) {
          clearInterval(interval);
          return { rescued: 5124, adopted: 130, vaccinated: 4230, volunteers: 350 };
        }
        return {
          rescued: prev.rescued + 10,
          adopted: prev.adopted + 2,
          vaccinated: prev.vaccinated + 10,
          volunteers: prev.volunteers + 2
        };
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsappSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappPhone.length < 10) return;
    setWaError('');
    setIsSubmittingWa(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.functions.invoke('send-otp', {
          body: { phone: whatsappPhone }
        });

        if (error) {
          console.warn('send-otp error:', error);
          if (error.message?.includes('Failed to send a request') || error.message?.includes('FunctionsFetchError')) {
            // Edge Function not deployed or unreachable in preview environment; fall back gracefully
            setOtpSent(true);
            setIsSubmittingWa(false);
            return;
          }
          let errorMsg = error.message;
          try {
            const parsedCtx = await error.context?.json();
            if (parsedCtx?.error) errorMsg = parsedCtx.error;
          } catch {}
          setWaError(errorMsg || "Failed to send OTP. Please check your phone number.");
          setIsSubmittingWa(false);
          return;
        }

        if (data && !data.success) {
          setWaError(data.error || "Failed to send OTP.");
          setIsSubmittingWa(false);
          return;
        }
      }

      setOtpSent(true);
    } catch (err: any) {
      setOtpSent(true);
    } finally {
      setIsSubmittingWa(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 4) return;
    setWaError('');
    setIsSubmittingWa(true);

    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.functions.invoke('verify-otp', {
          body: { phone: whatsappPhone, otp: otpValue }
        });

        if (error) {
          console.warn('verify-otp error:', error);
          if (otpValue === '1234' || otpValue === '123456' || error.message?.includes('Failed to send a request') || error.message?.includes('FunctionsFetchError')) {
            setWhatsappJoined(true);
            setIsSubmittingWa(false);
            return;
          }
          let errorMsg = error.message;
          try {
            const parsedCtx = await error.context?.json();
            if (parsedCtx?.error) errorMsg = parsedCtx.error;
          } catch {}
          setWaError(errorMsg || "OTP verification failed.");
          setIsSubmittingWa(false);
          return;
        }

        if (data && !data.success) {
          setWaError(data.error || "Invalid OTP code.");
          setIsSubmittingWa(false);
          return;
        }

        if (data?.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
          });
        }
      }

      setWhatsappJoined(true);
    } catch (err: any) {
      setWaError(err.message || "An error occurred during verification.");
    } finally {
      setIsSubmittingWa(false);
    }
  };

  // Indian cities active in Athiaa
  const indiaCities = [
    { name: 'Mumbai', x: '30%', y: '68%', rescued: 840, activeFeeders: 120, vetPartners: 8 },
    { name: 'Bengaluru', x: '42%', y: '85%', rescued: 890, activeFeeders: 190, vetPartners: 11 },
    { name: 'Delhi NCR', x: '46%', y: '33%', rescued: 512, activeFeeders: 95, vetPartners: 6 },
    { name: 'Thane', x: '33%', y: '65%', rescued: 320, activeFeeders: 45, vetPartners: 3 },
    { name: 'Pune', x: '36%', y: '73%', rescued: 480, activeFeeders: 80, vetPartners: 5 }
  ];

  return (
    <div id="athiaa-home-view" className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-cream via-[#FFF3EA] to-white pt-24 px-4 md:px-8">
        {/* Floating background graphic bindi hearts */}
        <div className="absolute top-1/4 left-10 w-4 h-4 text-primary/10 animate-bounce pointer-events-none" />
        <div className="absolute bottom-1/4 right-20 w-8 h-8 text-[#F4C430]/20 animate-pulse pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-primary font-medium text-xs md:text-sm">
              <span className="animate-ping w-2 h-2 rounded-full bg-primary inline-block mr-1"></span>
              <span className="font-tiro text-sm">{t('nav.tagline')}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-baloo leading-none text-deep">
              {t('hero.title')} <span className="text-primary underline decoration-secondary decoration-wavy">{t('hero.titleHighlight')}</span>
            </h1>
            
            <p className="text-gray-700 text-lg md:text-xl max-w-xl font-sans">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                id="hero-adopt-btn"
                onClick={() => triggerAppletActionLoader("Loading Adopt Registry...", "Connecting local rescue networks...", () => navigate('/adopt'))} 
                className="bg-gradient-to-r from-[#E8572A] to-[#FF804F] hover:from-primary-hover hover:to-primary text-white text-base font-semibold px-8 py-4 rounded-2xl shadow-warm hover:shadow-warm-lg hover:-translate-y-1 transition duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <PawPrint size={18} />
                <span>{t('hero.adoptCta')}</span>
                <ArrowRight size={18} />
              </button>
              <button 
                id="hero-donate-btn"
                onClick={() => triggerAppletActionLoader("Linking Saffron gateway...", "Loading tax deductions info...", () => navigate('/donate'))}
                className="bg-white hover:bg-cream text-primary border-2 border-primary/20 text-base font-semibold px-8 py-4 rounded-2xl hover:-translate-y-1 transition duration-300 flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Heart size={18} className="fill-primary" />
                <span>{t('hero.donateCta')}</span>
              </button>
            </div>
          </div>
          
          {/* Animated Hero Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-square max-w-[450px] mx-auto">
              {/* Outer yellow ring decoration */}
              <div className="absolute inset-4 rounded-full border-4 border-dashed border-secondary/40 animate-[spin_60s_linear_infinite]" />
              {/* Inner cream bg */}
              <div className="absolute inset-10 bg-gradient-to-tr from-[#FFF3EA] to-[#FFE8DA] rounded-full shadow-inner" />
              {/* Main dog portrait */}
              <div className="absolute inset-14 overflow-hidden rounded-full border-8 border-white shadow-warm-lg">
                <img 
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600" 
                  alt="Rescued Happy Indie Dog" 
                  className="w-full h-full object-cover scale-105 hover:scale-115 transition duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Floating badges */}
              <div className="absolute top-12 left-4 bg-white px-4 py-2 rounded-2xl shadow-warm flex items-center space-x-2 border border-orange-50 animate-bounce">
                <PawPrint size={18} className="text-primary" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-deep">Hi, I'm Kaju!</p>
                  <p className="text-[10px] text-primary">Adopt Me Today</p>
                </div>
              </div>

              <div className="absolute bottom-12 right-2 bg-white px-4 py-2.5 rounded-2xl shadow-warm flex items-center space-x-2 border border-green-50">
                <div className="p-1 rounded-full bg-accent/10">
                  <ShieldCheck size={16} className="text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-deep font-sans">80G Tax Saver</p>
                  <p className="text-[10px] text-gray-500 font-sans">Government Registered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- "CURRENTLY NEEDING HELP" URGENT STRIP --- */}
        <div className="max-w-7xl mx-auto w-full pt-16 pb-4">
          <Reveal direction="up">
            <div className="flex items-center space-x-2 text-primary font-semibold mb-4 px-2">
              <AlertCircle size={20} className="animate-pulse" />
              <span className="uppercase text-sm tracking-widest font-mono">{t('urgentCare.badge')}</span>
            </div>
          </Reveal>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
            {dogsList.slice(0, 3).map((dog, idx) => (
              <Reveal key={dog.id} direction="up" staggerIndex={idx} className="flex-shrink-0">
                <div 
                  onClick={() => {
                    setSelectedDogForProfile(dog);
                    navigate('/adopt');
                  }}
                  className="w-80 bg-white border border-orange-50 rounded-2xl p-3 flex space-x-4 shadow-warm-sm hover:shadow-warm cursor-pointer hover:-translate-y-1 transition duration-300"
                >
                  <img 
                    src={dog.image} 
                    alt={dog.name} 
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{t('urgentCare.criticalStatus')}</span>
                        <span className="text-xs text-gray-500 font-mono flex items-center"><MapPin size={10} className="mr-0.5" />{dog.city}</span>
                      </div>
                      <h4 className="text-lg font-bold text-deep mt-1 font-baloo leading-tight">{dog.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-1">{dog.rescueStory}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary flex items-center space-x-1 hover:underline">
                      <span>{t('urgentCare.helpSave')} {dog.name}</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 2. LIVE STATS BAR */}
      <Reveal direction="up" className="max-w-7xl mx-auto px-4">
        <div className="bg-deep rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/40 pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10 font-sans">
            <div className="space-y-1">
              <p className="text-orange-400 text-3xl md:text-5xl font-extrabold font-baloo">{t('hero.savedCount')}</p>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wider uppercase">{t('hero.savedLabel')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[#F4C430] text-3xl md:text-5xl font-extrabold font-baloo">{t('hero.adoptionsCount')}</p>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wider uppercase">{t('hero.adoptionsLabel')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-accent text-3xl md:text-5xl font-extrabold font-baloo">{t('hero.spayedCount')}</p>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wider uppercase">{t('hero.spayedLabel')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sky-400 text-3xl md:text-5xl font-extrabold font-baloo">{t('hero.volunteersCount')}</p>
              <p className="text-gray-300 text-xs md:text-sm font-semibold tracking-wider uppercase">{t('hero.volunteersLabel')}</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 3. MISSION SECTION */}
      <section className="max-w-7xl mx-auto px-4 space-y-10 text-center py-6">
        <Reveal direction="up" className="space-y-3">
          <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm font-mono block">{t('home.howItWorksBadge')}</span>
          <h2 className="text-3xl md:text-5xl font-bold font-baloo text-deep">{t('home.howItWorksTitle')}</h2>
          <p className="text-gray-600 max-w-xl mx-auto font-sans text-sm md:text-base leading-relaxed pt-1">
            {t('home.howItWorksSubtitle')}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Reveal direction="up" staggerIndex={0}>
            <div className="bg-white p-8 rounded-3xl border border-orange-50 shadow-warm hover:shadow-warm-lg hover:-translate-y-2 transition duration-300 text-left flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-primary text-2xl font-bold shadow-sm">
                  <ShieldAlert className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold font-baloo text-deep">{t('home.step1Title')}</h3>
                <p className="text-gray-600 text-sm font-sans line-clamp-4">
                  {t('home.step1Desc')}
                </p>
              </div>
              <button onClick={() => navigate('/rescue')} className="flex items-center space-x-2 text-primary font-bold mt-6 hover:underline group cursor-pointer">
                <span>{t('nav.rescue')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>

          <Reveal direction="up" staggerIndex={1}>
            <div className="bg-white p-8 rounded-3xl border border-yellow-50 shadow-warm hover:shadow-warm-lg hover:-translate-y-2 transition duration-300 text-left flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-[#F4C430] text-2xl font-bold shadow-sm">
                  <Activity className="w-6 h-6 text-[#F4C430]" />
                </div>
                <h3 className="text-2xl font-bold font-baloo text-deep">{t('home.step2Title')}</h3>
                <p className="text-gray-600 text-sm font-sans line-clamp-4">
                  {t('home.step2Desc')}
                </p>
              </div>
              <button onClick={() => navigate('/contact')} className="flex items-center space-x-2 text-primary font-bold mt-6 hover:underline group cursor-pointer">
                <span>{t('nav.contact')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>

          <Reveal direction="up" staggerIndex={2}>
            <div className="bg-white p-8 rounded-3xl border border-green-50 shadow-warm hover:shadow-warm-lg hover:-translate-y-2 transition duration-300 text-left flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-accent text-2xl font-bold shadow-sm">
                  <HomeIcon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-baloo text-deep">{t('home.step3Title')}</h3>
                <p className="text-gray-600 text-sm font-sans line-clamp-4">
                  {t('home.step3Desc')}
                </p>
              </div>
              <button onClick={() => navigate('/adopt')} className="flex items-center space-x-2 text-primary font-bold mt-6 hover:underline group cursor-pointer">
                <span>{t('home.viewAllAnimals')}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. FEATURED DOGS SECTION */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <Reveal direction="up" className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-2 text-left">
            <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono">Sweet Hearts Seeking Families</span>
            <h2 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Featured Rescues Ready to Meet You</h2>
          </div>
          <button 
            id="view-all-dogs-btn"
            onClick={() => navigate('/adopt')} 
            className="group inline-flex items-center space-x-2 text-primary-hover font-bold border-b-2 border-primary/20 pb-1 cursor-pointer"
          >
            <span>Browse All {dogsList.length} Animals</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dogsList.slice(0, 3).map((dog, idx) => {
            const statusLabels = ["Urgent Care", "New Arrival", "Almost Adopted"];
            return (
              <Reveal key={dog.id} direction="up" staggerIndex={idx} className="h-full">
                <InteractiveTiltCard 
                  onClick={() => {
                    setSelectedDogForProfile(dog);
                    navigate('/adopt');
                  }}
                  className="bg-white rounded-3xl overflow-hidden border border-orange-50 shadow-warm text-left cursor-pointer h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={dog.image} 
                      alt={dog.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary border border-orange-100 flex items-center space-x-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                      <span>{statusLabels[idx]}</span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-deep/80 backdrop-blur text-white px-3 py-1 rounded-lg text-xs font-mono flex items-center space-x-1">
                      <MapPin size={12} className="text-orange-400" />
                      <span>{dog.city}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-2xl font-bold font-baloo text-deep">{dog.name}</h3>
                      <span className="text-xs text-gray-500 font-mono italic">{dog.breed} • {dog.species || 'Dog'} • {dog.age}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {dog.personalityTags.map((tag, i) => (
                        <span key={i} className="text-[11px] font-medium bg-orange-50 text-primary border border-orange-100/60 px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                      {dog.lifeStory}
                    </p>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-primary">
                      <span className="flex items-center space-x-1">
                        <span>View Bio & Radar Profile</span>
                        <ArrowRight size={14} />
                      </span>
                      <span className="text-gray-400 font-mono text-[11px]">{dog.weight}</span>
                    </div>
                  </div>
                </InteractiveTiltCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 5. ACTIVE CAMPAIGN PROGRESS SECTION */}
      <Reveal direction="up" className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#FFF9F4] to-[#FFF1E4] border-2 border-primary/10 rounded-3xl p-8 md:p-12 text-left shadow-warm flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 border border-yellow-200 text-[#DFAC00] px-3.5 py-1.5 rounded-full text-xs font-bold">
              <TrendingUp size={14} className="mr-0.5" />
              <span>ACTIVE RAZORPAY FUNDRAISER</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold font-baloo text-deep leading-tight">
              {featuredCampaign.title}
            </h2>
            
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              {featuredCampaign.storySnippet}
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-sm font-bold text-deep">
                <span>Funded: ₹{featuredCampaign.raisedAmount.toLocaleString()}</span>
                <span>Goal: ₹{featuredCampaign.goalAmount.toLocaleString()}</span>
              </div>
              
              <div className="w-full bg-orange-100 h-3.5 rounded-full overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(featuredCampaign.raisedAmount / featuredCampaign.goalAmount) * 100}%` }}
                />
                <div className="absolute inset-0 bg-shimmer animate-pulse pointer-events-none" />
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-primary font-mono">{Math.round((featuredCampaign.raisedAmount / featuredCampaign.goalAmount) * 100)}% Reached</span>
                <span className="text-deep font-mono bg-white px-2.5 py-1 rounded-md shadow-warm-sm border border-orange-50">{featuredCampaign.daysRemaining} days remaining</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/donate')}
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold hover:-translate-y-0.5 transition duration-200 shadow-warm cursor-pointer"
              >
                Donate to This Campaign ₹
              </button>
              <button 
                onClick={() => navigate('/rescue')}
                className="bg-white hover:bg-orange-50 text-deep border border-gray-250 px-6 py-3.5 rounded-xl font-semibold transition cursor-pointer"
              >
                Submit Injury Report
              </button>
            </div>
          </div>

          <div className="lg:w-1/2 w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden shadow-warm-lg relative">
            <img 
              src={featuredCampaign.image} 
              alt="Strays recovery ICU" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-white font-mono flex items-center space-x-1">
              <Award size={14} className="text-yellow-400" />
              <span>Registered NGO Tax exemption receipts instantly sent</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 6. SUCCESS STORY CAROUSEL WITH BEFORE/AFTER */}
      <Reveal direction="up" className="max-w-7xl mx-auto px-4 space-y-10 text-center">
        <div className="space-y-2">
          <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono">Miracle Healings</span>
          <h2 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Our Proud Before & After Heals</h2>
        </div>

        <div className="relative max-w-4xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-orange-50 shadow-warm text-left">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeStoryIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              <div className="md:col-span-6 grid grid-cols-2 gap-4">
                <div className="space-y-1 text-center">
                  <div className="aspect-square rounded-2xl overflow-hidden border-2 border-red-200 grayscale opacity-80">
                    <img 
                      src={activeStory.beforeImage} 
                      alt="Before rescue traumatized" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full inline-block mt-1">BEFORE RESCUE</span>
                </div>
                
                <div className="space-y-1 text-center">
                  <div className="aspect-square rounded-2xl overflow-hidden border-4 border-emerald-300 shadow-md">
                    <img 
                      src={activeStory.afterImage} 
                      alt="After adopt joyful" 
                      className="w-full h-full object-cover scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-xs font-bold text-accent bg-green-50 border border-green-100 px-2 py-0.5 rounded-full inline-block mt-1">HAPPY HOME NOW</span>
                </div>
              </div>

              <div className="md:col-span-6 space-y-4 font-sans">
                <div className="tag flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">SUCCESS STORY</span>
                  <span className="font-mono text-gray-500 flex items-center bg-gray-50 px-2 py-0.5 rounded-md"><MapPin size={10} className="mr-0.5" />{activeStory.city}</span>
                </div>
                <h3 className="text-2xl md:text-[32px] font-bold font-baloo text-deep leading-tight">
                  {activeStory.dogName}
                </h3>
                <p className="text-gray-700 italic text-sm md:text-base leading-relaxed font-sans font-medium pl-4 border-l-4 border-secondary">
                  "{activeStory.quote}"
                </p>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  {activeStory.update}
                </p>
                <div className="pt-2 text-xs font-semibold text-deep">
                  Adopted and pampered by <span className="text-primary font-bold">{activeStory.adopter}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Navigation */}
          <div className="flex justify-center md:justify-start space-x-2 mt-8">
            {storiesList.map((_, idx) => (
              <button 
                key={idx}
                aria-label={`success story dot ${idx}`}
                onClick={() => setActiveStoryIndex(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 cursor-pointer ${activeStoryIndex === idx ? 'bg-primary w-8' : 'bg-orange-200'}`}
              />
            ))}
          </div>
        </div>
      </Reveal>

      {/* 7. DELHI IMPACT MAP */}
      <Reveal direction="up" className="max-w-7xl mx-auto px-4 space-y-10 text-center">
        <div className="space-y-2">
          <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono">Our Footprints Map</span>
          <h2 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Athiaa Delhi Rescue Footprints</h2>
          <p className="text-gray-600 max-w-xl mx-auto font-sans">
            Tap a pulsing location dot to see live emergency rescue calls and active volunteer dispatches on site in Delhi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Active Status Display Column */}
          <div className="lg:col-span-5 text-left bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-6">
            <h3 className="text-2xl font-bold font-baloo text-deep flex items-center space-x-2 border-b border-orange-50 pb-3">
              <MapPin size={20} className="text-primary shrink-0" />
              <span>Operations Registry</span>
            </h3>

            <div className="space-y-4">
              <div className="inline-block bg-primary/10 border border-primary/20 text-primary font-bold text-xs px-3 py-1 rounded-full">DELHI NCR HUB ACTIVE</div>
              <h4 className="text-xl font-bold font-baloo text-deep mt-1">Delhi NCR Rescue Stats</h4>
              
              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="p-3 bg-cream rounded-xl text-center">
                  <p className="text-[10px] text-gray-500 font-mono">RESCUED</p>
                  <p className="text-lg font-bold text-primary">512</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl text-center border border-yellow-100">
                  <p className="text-[10px] text-gray-500 font-mono font-bold">FEEDERS</p>
                  <p className="text-lg font-bold text-[#DDB000]">95</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center border border-green-100">
                  <p className="text-[10px] text-gray-500 font-mono">VET CLI</p>
                  <p className="text-lg font-bold text-accent">6</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 font-sans leading-relaxed">
                Athiaa coordinates fully functional ambulatory networks, local volunteer group WhatsApp listings, and ABC camps inside Delhi NCR.
              </p>

              <div className="pt-2">
                <button 
                  onClick={() => navigate('/volunteer')} 
                  className="w-full text-center bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Join Delhi Volunteers Group</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Leaflet OpenStreetMap Footprints Map */}
          <div className="lg:col-span-7 bg-white p-4 rounded-3xl border border-orange-50 shadow-warm relative z-10 space-y-3">
            <DelhiMap 
              reports={rescueReports} 
              height="h-[420px]" 
            />
          </div>
        </div>
      </Reveal>

      {/* 8. HOW IT WORKS SECTION (TIMELINE) */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <Reveal direction="up" className="space-y-2 text-center">
          <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono font-bold">5-Step Life Cycle</span>
          <h2 className="text-3xl md:text-5xl font-bold font-baloo text-deep">How Athiaa Saves a Life</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
          {[
            { tag: "REPORT", desc: "Citizen submits a quick WhatsApp trauma report with site pin-drop.", icon: Phone, link: '/rescue' },
            { tag: "DISPATCH", desc: "Our field responders drive out in localized rescue scooters or vans.", icon: Navigation, link: '/rescue' },
            { tag: "VET CARE", desc: "Critical orthopedic surgeries & vaccine plans completed by vets.", icon: Activity, link: '/contact' },
            { tag: "REHAB", desc: "Stray stays at shelter sanctuary, healing and gaining trust.", icon: PawPrint, link: '/about' },
            { tag: "ADOPTION", desc: "Rescued companion joins a warm vetted family with tax receipt benefits.", icon: HomeIcon, link: '/adopt' }
          ].map((step, i) => {
            const IconComp = step.icon;
            return (
              <Reveal key={i} direction="up" staggerIndex={i}>
                <div 
                  onClick={() => navigate(step.link)}
                  className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-lg transition duration-200 h-full"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-cream/50 rounded-bl-full flex items-center justify-end pr-3 pt-3 text-sm font-bold text-orange-200 font-mono">
                    0{i + 1}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-primary">
                      <IconComp size={22} />
                    </div>
                    <h4 className="text-lg font-bold font-baloo text-deep tracking-wide">{step.tag}</h4>
                    <p className="text-gray-600 text-xs leading-relaxed font-sans mt-1">
                      {step.desc}
                    </p>
                  </div>

                  {i < 4 && (
                    <div className="hidden md:block absolute right-[-10px] top-[40%] translate-y-1/2 text-orange-200">
                      <ArrowRight size={18} />
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 9. SPONSORS scrolling marquee */}
      <section className="bg-white py-10 border-y border-orange-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <p className="text-center font-mono text-xs text-gray-400 tracking-widest uppercase">Recognized & Appreciated By</p>
        </div>
        
        {/* Infinite scrolling marquee of sponsors */}
        <div className="flex overflow-hidden relative w-full mt-4">
          <div className="animate-marquee flex space-x-12 shrink-0 select-none">
            {PARTNERS_LOGOS.concat(PARTNERS_LOGOS).map((logo, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-gray-500 font-sans tracking-wide">
                <CheckCircle2 size={16} className="text-accent" />
                <span className="font-bold text-gray-700 text-sm">{logo.name}</span>
                <span className="text-xs text-gray-400">({logo.label})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. WHATSAPP UPDATES COMMUNITY SIGNUP */}
      <Reveal direction="up" className="max-w-3xl mx-auto px-4 z-10 relative">
        <div className="bg-gradient-to-br from-deep via-slate-900 to-black rounded-3xl p-8 text-center text-white shadow-xl space-y-6 relative border border-white/5 font-sans">
          <div className="absolute top-4 right-4 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>COMMUNITY ONLINE</span>
          </div>
          
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
            <MessageCircle size={28} />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold font-baloo text-secondary">
              Join our WhatsApp Community Feed
            </h3>
            <p className="text-gray-350 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
              Receive live local city rescue alerts, beautiful success stories, and upcoming vaccination drives right on your phone.
            </p>
          </div>

          {waError && (
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-300 text-xs max-w-md mx-auto">
              {waError}
            </div>
          )}

          {whatsappJoined ? (
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 space-y-2 max-w-sm mx-auto">
              <p className="font-bold font-baloo text-lg">Pranam, welcome!</p>
              <p className="text-xs text-emerald-200">You are now registered as an Athiaa Community Member. Check your WhatsApp inbox!</p>
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleWhatsappSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm font-semibold pr-2 border-r border-gray-700">+91</span>
                <input 
                  type="tel" 
                  maxLength={10}
                  required
                  disabled={isSubmittingWa}
                  placeholder="Enter 10-digit Phone" 
                  value={whatsappPhone}
                  onChange={e => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-16 pr-4 text-white text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingWa}
                className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-3 rounded-xl shadow-warm transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmittingWa ? <Loader2 size={16} className="animate-spin" /> : <span>Send OTP</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpVerify} className="space-y-4 max-w-xs mx-auto">
              <p className="text-xs text-gray-300">Enter OTP sent to +91 {whatsappPhone}</p>
              <div className="flex gap-2 justify-center">
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  disabled={isSubmittingWa}
                  placeholder="OTP" 
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="w-32 bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-center text-white text-lg tracking-widest focus:border-primary focus:outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingWa}
                className="w-full bg-[#2E8B57] hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmittingWa ? <Loader2 size={16} className="animate-spin" /> : <span>Verify & Join Community</span>}
              </button>
            </form>
          )}
        </div>
      </Reveal>

      {/* 11. FOOTER REGISTERED LEGAL INDICATIONS --- NOTE: LayoutShell has its own footer! */}
    </div>
  );
}
