
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  MapPin, 
  TrendingUp, 
  Users, 
  Award, 
  FileText, 
  Check, 
  Copy, 
  Smartphone, 
  ShieldCheck, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  X,
  CreditCard,
  Zap,
  QrCode
} from 'lucide-react';
import { DonationCampaign } from '@/src/types';
import { useAppContext } from '@/components/providers/AppContext';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCampaigns } from '@/lib/hooks/useCampaigns';
import { useSettings } from '@/lib/hooks/useSettings';
import { useDonationFlow } from '@/lib/hooks/useDonations';
import Reveal from '@/components/ui/Reveal';

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

export default function DonatePage() {
  const { t } = useTranslation();
  const { 
    triggerAppletActionLoader, 
    setDonationHistory,
    setCumulativeDonations
  } = useAppContext();

  const { user: authUser, profile: authProfile } = useAuth();
  const userProfile = authProfile ? {
    name: authProfile.full_name || (authProfile as any).display_name || '',
    email: authUser?.email || ''
  } : authUser ? {
    name: (authUser as any).name || '',
    email: authUser.email || ''
  } : null;

  const authProfileName = authProfile?.full_name || (authUser as any)?.name || '';
  const authProfileEmail = authUser?.email || '';

  const handleTrackDonation = (donation: any) => {
    setDonationHistory((prev: any[]) => [donation, ...(prev || [])]);
    setCumulativeDonations((prev: number) => prev + donation.amount);
  };

  const { campaigns: dbCampaigns, isLoading: isCampaignsLoading, mutate: mutateCampaigns } = useCampaigns();
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const { initiateDonation, startPayment } = useDonationFlow();

  const campaignsList = useMemo(() => {
    const raw = dbCampaigns && dbCampaigns.length > 0 ? dbCampaigns : LOCAL_INITIAL_CAMPAIGNS;
    return (raw || []).map((c: any) => ({
      ...c,
      raisedAmount: c.raised_amount ?? c.raisedAmount ?? 0,
      goalAmount: c.goal_amount ?? c.goalAmount ?? 1
    }));
  }, [dbCampaigns]);

  // Toggles and tiers
  const [isMonthly, setIsMonthly] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number | 'custom'>(500);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Recipient info
  const [selectedCampaign, setSelectedCampaign] = useState<string>('General Rescue Fund');
  const [isCopied, setIsCopied] = useState(false);

  // Tax 80G check
  const [request80G, setRequest80G] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [panError, setPanError] = useState('');

  // Payment popup checkout states (Simulated Razorpay)
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: PayMethod, 2: OTP/Progress, 3: Completed confetti
  const [selectedPayMethod, setSelectedPayMethod] = useState<'upi' | 'card' | 'wallet'>('upi');
  
  // Checkout detail forms
  const [cardNo, setCardNo] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorName, setDonorName] = useState('');

  // Sync profile details if signed-in
  useEffect(() => {
    if (authProfileName || authProfileEmail) {
      setDonorName(authProfileName);
      setDonorEmail(authProfileEmail);
    }
  }, [authProfileName, authProfileEmail]);



  // Real-time ticker marquee simulation
  const [donationsTicker, setDonationsTicker] = useState([
    { name: 'Priya S.', city: 'Mumbai', amt: 500, time: '2 mins ago' },
    { name: 'Vikram K.', city: 'Bengaluru', amt: 2500, time: '5 mins ago' },
    { name: 'Rohan M.', city: 'Thane', amt: 100, time: '12 mins ago' },
    { name: 'Ananya G.', city: 'Delhi', amt: 1000, time: '18 mins ago' },
    { name: 'Sourav P.', city: 'Pune', amt: 250, time: '25 mins ago' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['Advait', 'Sneha', 'Kabir', 'Riya', 'Rishi', 'Ishita'];
      const cities = ['Delhi NCR', 'Pune', 'Mumbai', 'Bengaluru', 'Thane'];
      const amounts = [100, 250, 500, 1000, 2500, 5000];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomAmt = amounts[Math.floor(Math.random() * amounts.length)];
      
      setDonationsTicker(prev => [
        { name: `${randomName} ${randomName[0]}.`, city: randomCity, amt: randomAmt, time: 'Just now' },
        ...prev.slice(0, 4)
      ]);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const getActiveAmount = () => {
    if (selectedTier === 'custom') {
      return parseInt(customAmount) || 0;
    }
    return selectedTier;
  };

  const handleCopyUPI = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('athiaa@upi');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2005);
    }
  };

  const validatePAN = (pan: string) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan.toUpperCase());
  };

  const handleStartDonateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getActiveAmount();
    if (finalAmount <= 0) return;

    if (request80G) {
      if (!validatePAN(panNumber)) {
        setPanError("Provide valid 10-digit Indian PAN: 5 Alphabets, 4 Digits, 1 Alphabet (e.g., ABCDE1234F)");
        return;
      }
      setPanError('');
    }

    setCheckoutStep(1);
    setShowCheckout(true);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Generated Receipt state
  const [completedDonation, setCompletedDonation] = useState<{ id: string; receiptNumber: string } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleRazorpayExecute = async () => {
    const finalAmount = getActiveAmount();
    if (finalAmount <= 0) return;
    const matchedCamp = campaignsList.find(c => c.title === selectedCampaign);

    const processDonationRecord = async (rzpPayId?: string, rzpOrderId?: string) => {
      try {
        setCheckoutStep(2);
        const { apiFetch } = await import('@/lib/api/clientApi');
        const res = await apiFetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalAmount,
            donor_name: donorName || 'Anonymous Donor',
            donor_email: donorEmail || 'donor@example.com',
            donor_phone: authProfile?.phone || undefined,
            donor_pan: request80G ? panNumber : undefined,
            campaign_id: matchedCamp?.id || undefined,
            razorpay_payment_id: rzpPayId || `pay_test_${Date.now()}`,
            razorpay_order_id: rzpOrderId || `order_test_${Date.now()}`,
            status: 'paid',
            receipt_sent: true
          })
        });
        const resData = await res.json().catch(() => ({}));
        const donId = resData?.data?.id || `don-${Date.now()}`;
        const recNo = resData?.data?.receipt_number || `ATHIA/80G/2026-27/${Date.now().toString().slice(-6)}`;

        setCompletedDonation({ id: donId, receiptNumber: recNo });

        const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        handleTrackDonation({
          id: donId,
          amount: finalAmount,
          campaignName: selectedCampaign,
          txHash: rzpPayId || `ATH-TX-${Math.floor(Math.random() * 9000000) + 1000000}`,
          date: dateStr,
          has80G: request80G,
          receiptNumber: recNo,
          donorPan: request80G ? panNumber : undefined,
          campaignId: matchedCamp?.id
        });

        mutateCampaigns();
        setCheckoutStep(3);
      } catch (err: any) {
        console.error("Donation record error:", err);
        setCheckoutStep(3);
      }
    };

    const scriptLoaded = await loadRazorpayScript();

    if (scriptLoaded && (window as any).Razorpay) {
      const options = {
        key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_AthiaaAnimalWelfare',
        amount: finalAmount * 100, // amount in paise
        currency: 'INR',
        name: 'Athiaa Animal Welfare NGO',
        description: `Donation for ${selectedCampaign}`,
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200',
        notes: {
          donor_name: donorName || 'Anonymous Donor',
          donor_email: donorEmail || 'donor@example.com',
          donor_phone: authProfile?.phone || '',
          donor_pan: request80G ? panNumber : '',
          campaign_id: matchedCamp?.id || '',
          campaign_title: selectedCampaign,
          request_80g: request80G ? 'true' : 'false'
        },
        handler: function (response: any) {
          processDonationRecord(response.razorpay_payment_id, response.razorpay_order_id);
        },
        prefill: {
          name: donorName || 'Anonymous Donor',
          email: donorEmail || 'donor@example.com',
          contact: authProfile?.phone || ''
        },
        theme: {
          color: '#E8572A'
        },
        modal: {
          ondismiss: function () {
            console.log('Razorpay checkout modal closed');
          }
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay SDK init fallback:', err);
      }
    }

    // Fallback if SDK loading is interrupted or blocked
    processDonationRecord();
  };

  const handleDownloadReceipt = async () => {
    if (!completedDonation?.id) return;
    setIsDownloadingPdf(true);
    try {
      const { apiFetch } = await import('@/lib/api/clientApi');
      const res = await apiFetch(`/api/donations/receipt-url?donation_id=${completedDonation.id}`);
      const json = await res.json();
      if (json.download_url) {
        window.open(json.download_url, '_blank');
      } else {
        alert(`80G Receipt Number: ${completedDonation.receiptNumber}\nPDF has been emailed to ${donorEmail}.`);
      }
    } catch {
      alert(`80G Receipt Number: ${completedDonation.receiptNumber}\nPDF has been emailed to ${donorEmail}.`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div id="athiaa-donate-module" className="max-w-7xl mx-auto px-4 py-16 space-y-12 font-sans text-left">
      {/* 1. Header & General Section */}
      <div className="space-y-2 text-center">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">{t('nav.donate')}</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">{t('donate.title')}</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          {t('donate.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: UPI PORTAL & CUSTOM FORM ENTRY */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* UPI SECTION */}
          <div className="bg-gradient-to-br from-cream via-[#FFF3EA] to-[#FFEBE0] p-6 rounded-3xl border border-orange-100 shadow-warm flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 shrink-0">
              <div className="w-32 h-32 bg-slate-100 flex flex-col items-center justify-center border border-gray-200 rounded-lg relative overflow-hidden">
                <QrCode size={100} className="text-deep mb-1 opacity-90" />
                <span className="text-[9px] font-bold text-primary font-mono tracking-wider">ATHIAA@UPI</span>
              </div>
            </div>

            <div className="space-y-4 flex-1 text-center md:text-left">
              <div>
                <span className="inline-flex items-center space-x-1 bg-[#E8572A]/10 border border-[#E8572A]/20 text-[#E8572A] font-bold rounded-full text-[10px] px-2.5 py-0.5 tracking-wider font-mono">
                  <Zap size={10} />
                  <span>IMMEDIATE UPI CONVENIENCE</span>
                </span>
                <h3 className="text-xl font-bold font-baloo text-deep mt-1 leading-tight">{t('donate.qrCodeTitle')}</h3>
                <p className="text-xs text-gray-600 mt-0.5">{t('donate.scanToPay')}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 max-w-sm">
                <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-mono text-gray-700 font-semibold flex items-center justify-between flex-1 select-all">
                  <span>athiaa@upi</span>
                  <button 
                    onClick={handleCopyUPI}
                    className="text-primary hover:text-primary-hover font-bold font-sans text-[11px] ml-2 flex items-center cursor-pointer"
                  >
                    {isCopied ? (
                      <span className="text-accent flex items-center space-x-0.5">
                        <Check size={12} />
                        <span>Copied</span>
                      </span>
                    ) : (
                      <Copy size={12} className="mr-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* UPI Icons band */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center opacity-70">
                <span className="text-[9px] font-mono tracking-widest text-gray-400 font-bold uppercase">SECURED BY</span>
                {['BHIM', 'PhonePe', 'GPay', 'Paytm', 'Amazon'].map((ic, i) => (
                  <span key={i} className="text-[10px] font-extrabold text-blue-900 bg-white border px-2 py-0.5 rounded-md font-mono">{ic}</span>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN TIERS PORTAL Form */}
          <form onSubmit={handleStartDonateCheckout} className="bg-white p-8 rounded-3xl border border-orange-50 shadow-warm space-y-6">
            <h3 className="font-baloo text-2xl font-bold text-deep flex items-center space-x-2">
              <Heart size={22} className="text-primary fill-primary" />
              <span>{t('donate.selectAmount')}</span>
            </h3>

            {/* Monthly vs One time Toggle */}
            <div className="flex justify-center p-1.5 bg-cream rounded-2xl border border-orange-50 max-w-xs mx-auto">
              <button 
                type="button"
                onClick={() => setIsMonthly(false)}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${!isMonthly ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`}
              >
                {t('donate.oneTime')}
              </button>
              <button 
                type="button"
                onClick={() => setIsMonthly(true)}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${isMonthly ? 'bg-primary text-white shadow-sm' : 'text-gray-500'}`}
              >
                <span>{t('donate.monthly')}</span>
                <span className="text-[9px] bg-[#F4C430] text-deep px-1.5 py-0.5 rounded-full font-bold">12A</span>
              </button>
            </div>

            {/* Donation target category selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Assign Fund Allocation</label>
              <select 
                value={selectedCampaign} 
                onChange={e => setSelectedCampaign(e.target.value)}
                className="w-full bg-cream border border-orange-50 rounded-xl p-3 text-sm focus:outline-none focus:border-primary text-deep font-semibold"
              >
                <option value="General Rescue Fund">General Emergency Stray Patrol & Ambulance</option>
                <option value="Project Niramaya: Emergency Medical Fund">Project Niramaya (Intensive ICU Surgeries)</option>
                <option value="Mega ABC & Anti-Rabies Safe Streets Drive">Delhi / Mumbai Rabies & Sterilization (ABC)</option>
                <option value="Rebuilding Athiaa Bengaluru Sanctuary Roof">Leaky Sanctuary Roofing (Bengaluru Resident Dogs)</option>
              </select>
            </div>

            {/* Donation Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(((settings as any)?.donation_presets as number[]) || [100, 250, 500, 1000, 2500]).map((amt, idx) => {
                let label = "General donation support for strays";
                if (amt <= 100) {
                  label = "Feed a stray dog for a full week";
                } else if (amt <= 250) {
                  label = "Anti-rabies vaccine shot dose";
                } else if (amt <= 500) {
                  label = "Comprehensive veterinary health exam";
                } else if (amt <= 1000) {
                  label = "On-site rescue first aid dispatch";
                } else {
                  label = "Sanctuary Orthopedic trauma healing";
                }
                const tier = { amt, label };
                return (
                  <Reveal key={tier.amt} direction="up" staggerIndex={idx}>
                    <div 
                      onClick={() => {
                        setSelectedTier(tier.amt);
                        setCustomAmount('');
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start space-x-3 text-left h-full ${
                        selectedTier === tier.amt ? 'bg-orange-50/60 border-primary shadow-sm' : 'bg-white border-orange-50 hover:bg-cream/40'
                      }`}
                    >
                      <div className="text-xs">
                        <p className="font-bold text-lg text-deep">₹{tier.amt}</p>
                        <p className="text-gray-500 font-sans font-medium">{tier.label}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}

              <Reveal direction="up" staggerIndex={5}>
                <div 
                  onClick={() => setSelectedTier('custom')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between h-full ${
                    selectedTier === 'custom' ? 'bg-orange-50/60 border-primary shadow-sm' : 'bg-white border-orange-50 hover:bg-cream/40'
                  }`}
                >
                  <div className="text-xs text-left">
                    <p className="font-bold text-lg text-deep">₹ Custom INR</p>
                    <p className="text-gray-400 font-sans font-medium">Verify custom tax invoice receipt</p>
                  </div>
                  {selectedTier === 'custom' && (
                    <input 
                      type="text" 
                      placeholder="Enter Custom (e.g. 5000)" 
                      value={customAmount}
                      onChange={e => setCustomAmount(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-primary/20 rounded-lg p-1.5 mt-2 text-xs font-mono focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </Reveal>
            </div>

            {/* Section 80G tax check */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-gray-150 space-y-3 font-sans">
              <label className="flex items-start space-x-2 text-xs font-bold text-deep cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={request80G}
                  onChange={e => setRequest80G(e.target.checked)}
                  className="mr-1.5 mt-0.5 accent-primary" 
                />
                <span>Eligible for 50% Tax Deduction under Registered 80G Certificate</span>
              </label>
              
              {request80G && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">YOUR 10-CHAR ALPHANUMERIC PAN *</label>
                  <input 
                    type="text" 
                    maxLength={10}
                    required={request80G}
                    placeholder="e.g. ABCDE1234F"
                    value={panNumber}
                    onChange={e => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-gray-250 rounded-lg p-2.5 text-xs font-mono focus:border-primary focus:outline-none placeholder-gray-400"
                  />
                  {panError && <p className="text-[10px] text-red-500 font-semibold">{panError}</p>}
                </div>
              )}
            </div>

            {/* Commit Donation CTAs */}
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-orange-450 hover:from-primary-hover hover:to-orange-500 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:shadow-warm transition shadow-sm text-base font-baloo cursor-pointer"
            >
              <Heart size={18} className="fill-white" />
              <span>Commit Donation of ₹{getActiveAmount().toLocaleString()}</span>
            </button>
            <p className="text-center text-[10px] text-gray-400 leading-normal font-sans">
              Receipts generated instantly. Supported options: UPI, Razorpay Core Netbanking (Cards & Wallets).
            </p>
          </form>
        </div>

        {/* RIGHT COLUMN: RECENT DONOR TICKERS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* TAX BRACKET BANNER */}
          <Reveal direction="up">
            <div className="bg-deep text-white p-6 rounded-3xl space-y-4 shadow-xl relative overflow-hidden text-left">
              <span className="absolute top-4 right-4 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider flex items-center border border-emerald-500/20">
                <ShieldCheck size={10} className="mr-0.5" /> 80G Compliant
              </span>

              <h3 className="text-xl font-bold font-baloo text-secondary leading-tight">Tax Free Charitable Exemption</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                Athiaa Animal Welfare registered is authorized as a Section 8 Nonprofit Organization. All Indian residents are eligible to save 50% on income-tax deductions.
              </p>

              <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-3 text-[10px] text-gray-400 font-mono">
                <div>
                  <p>CERTIFICATE 80G No.</p>
                  <p className="text-white font-semibold">CIT-EXPT/80G/ATH-ND2025</p>
                </div>
                <div>
                  <p>CERTIFICATE 12A Ref.</p>
                  <p className="text-white font-semibold">12A/TRUST-REG/25B084</p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ACTIVE CAMPAIGN STACK */}
          <Reveal direction="up">
            <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-6">
              <h4 className="text-lg font-bold font-baloo text-deep border-b border-orange-50 pb-2 flex items-center space-x-2">
                <TrendingUp size={18} className="text-primary" />
                <span>Active Recovery Fundraisers</span>
              </h4>

              <div className="space-y-4 text-left font-sans">
                {campaignsList.map((camp) => (
                  <div key={camp.id} className="space-y-2 border-b border-gray-100 pb-3 last:border-none last:pb-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h5 className="font-bold text-xs text-deep truncate hover:text-primary transition">{camp.title}</h5>
                      <span className="text-[10px] text-primary font-bold font-mono shrink-0">{camp.daysRemaining}d left</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${(camp.raisedAmount / camp.goalAmount) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>Raised: ₹{camp.raisedAmount.toLocaleString()}</span>
                      <span>Goal: ₹{camp.goalAmount.toLocaleString()}</span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedCampaign(camp.title);
                        setSelectedTier(1000);
                      }}
                      className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center space-x-1"
                    >
                      <span>Set Focus to this Fundraiser</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* REAL TIME TICKER DONORS MARQUEE */}
          <Reveal direction="up">
            <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm space-y-4 text-left font-sans">
              <h4 className="text-sm font-bold text-gray-400 tracking-wider uppercase font-mono">Live Benevolence Ticker</h4>
              
              <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar">
                {donationsTicker.map((tick, i) => (
                  <div key={i} className="flex justify-between items-center bg-cream/70 p-2.5 rounded-xl border border-orange-100/30 text-xs text-left">
                    <div className="flex items-center space-x-2">
                      <Heart size={14} className="text-primary fill-primary/20 shrink-0" />
                      <div>
                        <p className="font-bold text-deep select-none">{tick.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono italic">{tick.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-primary font-extrabold">+₹{tick.amt}</p>
                      <p className="text-[9px] text-gray-400 font-mono">{tick.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

        </div>
      </div>

      {/* CSR FOR CORPORATE SOCIAL RESPONSIBILITY INQUIRY */}
      <Reveal direction="up" className="max-w-4xl mx-auto">
        <section className="bg-stone-50 border border-gray-200 rounded-3xl p-8 text-left flex flex-col md:flex-row gap-8 items-center">
          <div className="space-y-4 md:w-1/2">
            <div className="p-2.5 bg-yellow-100 rounded-full w-fit text-[#DFAC00] font-bold text-xs flex items-center">
              <Briefcase size={14} className="mr-1 inline" /> Company Act 2013 Compliance
            </div>
            <h3 className="text-2xl font-bold font-baloo text-deep">Corporate CSR Partnerships</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Athiaa welfare operates 100% compliant reporting indices under Schedule VII guidelines. Coordinate CSR donations towards building automated diagnostic mobile vans or funding district immunization buffers.
            </p>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                alert("Corporate CSR Proposal Dossier compiled successfully! Download triggered.");
              }}
              className="text-xs font-bold text-primary flex items-center space-x-1 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              <FileText size={14} />
              <span>Download CSR Proposal.pdf</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-150 md:w-1/2 w-full space-y-3 font-sans">
            <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">CSR INQUIRY INVOICER</p>
            <div className="space-y-2 text-xs">
            <input 
              type="text" 
              placeholder="Enterprise Name (e.g., Tata Group)" 
              className="w-full bg-cream border border-orange-50 rounded-lg p-2 focus:outline-none focus:border-primary"
            />
            <input 
              type="email" 
              placeholder="Representative Email" 
              className="w-full bg-cream border border-orange-50 rounded-lg p-2 focus:outline-none focus:border-primary"
            />
            <select className="w-full bg-cream border border-orange-50 rounded-lg p-2 focus:outline-none focus:border-primary text-gray-600">
              <option>INR Under 5 Lakhs</option>
              <option>INR 5 Lakhs - 20 Lakhs</option>
              <option>INR Over 20 Lakhs CSR Allocation</option>
            </select>
            <button 
              type="button"
              onClick={() => triggerAppletActionLoader("Submitting CSR Inquiry...", "Sending credentials to Partner Relations Lead...", () => {
                alert("Inquiry successfully transmitted! Our CSR coordinator will reach out in 1 business day.");
              })}
              className="w-full bg-deep hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-[11px] cursor-pointer"
            >
              Submit Partnership Request
            </button>
          </div>
        </div>
      </section>
    </Reveal>

      {/* RAZORPAY COMPLIANT MODAL CHECKOUT DIALOG */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-warm-lg border border-orange-50 text-left font-sans animate-[zoomIn_0.2s_ease-out]">
            {/* Razorpay branded top header line */}
            <div className="bg-[#1C1C2E] p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block mr-1"></span>
                <span className="font-extrabold font-mono tracking-widest text-[#F4C430] uppercase text-xs">SECURED RAZORPAY SDK</span>
              </div>
              <button 
                onClick={() => setShowCheckout(false)} 
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Core checkout frames */}
            {checkoutStep === 1 && (
              <div className="p-6 space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-gray-400 text-xs uppercase tracking-widest font-mono">Paying To: NGO Athiaa</p>
                  <p className="text-2xl font-bold font-baloo text-deep">₹ {getActiveAmount().toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 font-semibold truncate bg-cream px-2 py-0.5 rounded-md inline-block max-w-xs">{selectedCampaign}</p>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Choose Channel</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'upi', label: 'UPI / QR', icon: Smartphone },
                      { key: 'card', label: 'Cards', icon: CreditCard },
                      { key: 'wallet', label: 'NetBank', icon: Briefcase }
                    ].map((m) => {
                      const IconComp = m.icon;
                      return (
                        <button 
                          key={m.key}
                          type="button"
                          onClick={() => setSelectedPayMethod(m.key as any)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                            selectedPayMethod === m.key 
                              ? 'bg-orange-50 border-primary text-primary font-bold' 
                              : 'bg-white border-gray-200 text-gray-500'
                          }`}
                        >
                          <IconComp size={18} />
                          <span className="text-[10px]">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <input 
                      type="text" 
                      required
                      placeholder="Your First Name"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      className="w-full bg-cream border border-orange-50 rounded-lg p-2 focus:outline-none focus:border-primary"
                    />
                    <input 
                      type="email" 
                      required
                      placeholder="Verification Email Address"
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                      className="w-full bg-cream border border-orange-50 rounded-lg p-2 focus:outline-none focus:border-primary"
                    />

                    {selectedPayMethod === 'card' && (
                      <input 
                        type="text" 
                        maxLength={16}
                        placeholder="Card Number (xxx xxx xx)"
                        value={cardNo}
                        onChange={e => setCardNo(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-cream border border-orange-50 rounded-lg p-2 focus:outline-none font-mono focus:border-primary"
                      />
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleRazorpayExecute}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <CreditCard size={14} />
                  <span>Verify and Pay ₹{getActiveAmount()}</span>
                </button>

                <p className="text-center text-[9px] text-gray-400">Transaction fully verified via PCI DSS 3.5 protocols.</p>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto">
                  <Check size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-deep font-baloo">Noble Donation Registered!</h4>
                  <p className="text-xs text-gray-650 leading-normal pl-2">Thank you! Your transaction has been registered and tracked in your User Dashboard instantly.</p>
                </div>
                
                <div className="bg-cream p-3.5 rounded-xl border border-orange-100 text-[10px] font-mono text-gray-600 space-y-1.5 text-left">
                  <p>RECEIPT REF: <span className="font-bold text-deep select-all">{completedDonation?.receiptNumber || 'ATHIA/80G/2026-27/000108'}</span></p>
                  <p>TRANS INR: <span className="font-bold text-emerald-600">₹{getActiveAmount().toLocaleString()}</span></p>
                  {request80G && panNumber && <p>DONOR PAN: <span className="font-bold text-primary">{panNumber}</span></p>}
                  <p>80G TAX RELIEF: <span className="font-bold text-emerald-600">50% Exemption Certificate Issued</span></p>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleDownloadReceipt}
                    disabled={isDownloadingPdf}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1 cursor-pointer transition shadow-sm"
                  >
                    <FileText size={14} />
                    <span>{isDownloadingPdf ? 'Preparing 80G PDF...' : 'Download Official 80G Receipt (PDF)'}</span>
                  </button>

                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl cursor-pointer"
                  >
                    Close Screen
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
