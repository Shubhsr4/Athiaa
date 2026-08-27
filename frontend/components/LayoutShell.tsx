
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Menu, 
  X, 
  ShoppingBag, 
  Phone, 
  Plus, 
  Minus, 
  MessageCircle, 
  Globe,
  Home as HomeIcon,
  PawPrint,
  ShieldAlert,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAppContext } from '@/components/providers/AppContext';
import DogRunningLoader from '@/components/ui/DogRunningLoader';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname || '/';
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { profile, signOut } = useAuth();
  const {
    cartItems,
    setCartItems,
    cartOpen,
    setCartOpen,
    loaderState,
    triggerAppletActionLoader,
    updateCartQuantity,
    getCartTotal
  } = useAppContext();

  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on path changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleCheckoutCartFromDrawer = () => {
    if (cartItems.length === 0) return;
    const finalBill = getCartTotal();
    setCartItems([]);
    setCartOpen(false);
    alert(`Merch order placed successfully for ₹${finalBill.toLocaleString()}!\nProceeds added directly to rescue medicine caches.`);
  };

  const currentLangLabel = i18n.language?.toLowerCase().startsWith('hi') ? 'HI' : 'EN';

  const menuItems = [
    { key: 'home', txt: t('nav.home'), path: '/' },
    { key: 'adopt', txt: t('nav.adopt'), path: '/adopt' },
    { key: 'donate', txt: t('nav.donate'), path: '/donate' },
    { key: 'rescue', txt: t('nav.rescue'), path: '/rescue' }
  ];

  const communityItems = [
    { key: 'foster', txt: t('nav.foster'), path: '/foster' },
    { key: 'success', txt: t('nav.success'), path: '/success-stories' },
    { key: 'volunteer', txt: t('nav.volunteer'), path: '/volunteer' },
    { key: 'events', txt: t('nav.events'), path: '/events' },
    { key: 'about', txt: t('nav.about'), path: '/about' },
    { key: 'contact', txt: t('nav.contact'), path: '/contact' }
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1C1C2E] flex flex-col justify-between relative selection:bg-orange-100 selection:text-primary pb-12 lg:pb-0">
      
      {/* Dynamic Animated Core Dog Intro Loader Overlay State */}
      {loaderState.isVisible && (
        <DogRunningLoader 
          isVisible={loaderState.isVisible}
          textOverride={loaderState.title} 
          subtextOverride={loaderState.subtext} 
        />
      )}

      {/* ────────────────────────────────────────────────────────
          A. NAVIGATION & CORE HEADER BRAND
          ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 bg-[#FFFBF7]/90 backdrop-blur-md z-30 border-b border-orange-100/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Logo Brand Silhouette INDog with heart bindi */}
          <Link 
            to="/"
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            {/* Minimalist INDog shape custom SVG design illustration */}
            <div className="w-10 h-10 bg-gradient-to-tr from-[#E8572A] to-[#F4C430] rounded-2xl flex items-center justify-center p-1.5 shadow-sm transform group-hover:rotate-6 transition">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M78.6,35.4c-1.3-1.6-4.2-2.1-5.6-0.7L62.1,45.6c-1.5,1.5-2,3.8-1.4,5.8l2,6.5c0.5,1.7,2.2,2.8,4,2.5l7.1-1.3c2-0.4,3.3-2.1,3.2-4.1l-0.3-6.6C76.6,39.5,79.8,36.8,78.6,35.4z" />
                <path d="M49.8,40.1c1.5-3.5,6.5-1.5,5.1,2c-1.1,2.7-3.6,1.4-5.1-2z" />
                <circle cx="58" cy="45" r="4" fill="#1c1c2e" />
                <path d="M25,65 L35,55 L45,65 Z" fill="#ffffff" />
              </svg>
            </div>

            <div className="text-left font-sans leading-none">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl md:text-2xl font-bold font-baloo tracking-tight text-[#1C1C2E] uppercase">{t('nav.brandName')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
              </div>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-mono tracking-wide mt-0.5">{t('nav.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Nav Actions */}
          <nav className="hidden lg:flex items-center space-x-1 font-sans font-bold text-xs text-gray-600">
            {menuItems.map((item) => (
              <Link 
                key={item.key}
                to={item.path}
                className={`px-3 py-2 rounded-xl transition ${pathname === item.path ? 'bg-orange-50 text-primary font-bold' : 'hover:bg-cream'}`}
              >
                {item.txt}
              </Link>
            ))}

            {/* Dropdown for other pages */}
            <div className="relative group/more">
              <button className="px-3 py-2 hover:bg-cream rounded-xl flex items-center space-x-1 cursor-pointer">
                <span>More</span>
                <span className="text-[10px] text-gray-400">▼</span>
              </button>
              
              <div className="absolute top-full left-0 bg-white border rounded-2xl p-2.5 shadow-lg w-52 hidden group-hover/more:block text-left text-xs font-semibold text-gray-600 animate-[fadeIn_0.15s_ease-out]">
                {communityItems.map((item) => (
                  <Link 
                    key={item.key}
                    to={item.path}
                    className={`w-full text-left px-3 py-2 rounded-xl hover:bg-cream transition block ${pathname === item.path ? 'bg-orange-50 text-primary' : ''}`}
                  >
                    {item.txt}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right corner indicators: Lang, Dashboard, Mobile humburger */}
          <div className="flex items-center space-x-2 md:space-x-3">
            
            {/* Bilingual Language Switcher */}
            <button 
              onClick={() => {
                const nextLang = i18n.language?.toLowerCase().startsWith('hi') ? 'en' : 'hi';
                i18n.changeLanguage(nextLang);
              }}
              className="p-2.5 bg-cream/80 hover:bg-orange-100 border border-orange-100 hover:border-primary/40 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-sm select-none"
              title="Change Language"
            >
              <Globe size={14} className="text-primary" />
              <span className="text-deep font-bold">{currentLangLabel}</span>
            </button>

            {/* Profile Avatar / Login Action */}
            {profile ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/dashboard"
                  className="flex items-center space-x-1.5 cursor-pointer bg-cream p-1.5 rounded-xl border border-orange-50 font-sans text-xs select-none hover:shadow-xs transition"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center font-bold text-white text-[10px]">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={12} className="text-white" />
                    )}
                  </div>
                  <span className="hidden md:inline font-bold text-deep pr-1">
                    {(((profile as any).name || profile.display_name || profile.full_name || 'Member')).split(' ')[0]}
                  </span>
                </Link>
                
                {['admin', 'super_admin'].includes(profile.role) && (
                  <Link
                    to="/admin"
                    className="bg-orange-100 hover:bg-orange-200 text-primary text-[10px] font-bold px-2 py-1.5 rounded-lg border border-orange-250 font-sans"
                  >
                    Admin
                  </Link>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-deep hover:bg-slate-900 text-white font-sans text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer inline-block"
              >
                Sign In
              </Link>
            )}

            {/* Hamburger menu button for mobile layout */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2.5 bg-cream hover:bg-orange-50 rounded-xl border border-orange-100"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

          </div>

        </div>

        {/* Mobile slide open menu items list */}
        {menuOpen && (
          <div className="lg:hidden p-4 bg-white border-t border-orange-100/65 flex flex-col gap-1 text-left text-sm font-sans font-bold text-gray-600 block animate-[slideDown_0.2s_ease-out]">
            {[...menuItems, ...communityItems].map(item => (
              <Link 
                key={item.key}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`w-full text-left px-4 py-2.5 rounded-xl hover:bg-cream transition block ${pathname === item.path ? 'bg-orange-50 text-primary' : ''}`}
              >
                {item.txt}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ────────────────────────────────────────────────────────
          B. CORE ROUTE VIEWPORT
          ──────────────────────────────────────────────────────── */}
      <main className="flex-grow">
        {children}
      </main>

      {/* ────────────────────────────────────────────────────────
          C. FOOTER AND FLOATING ASSIST TELEMETRICS
          ──────────────────────────────────────────────────────── */}
      
      {/* Dynamic Drawer for Shop Merch Basket items checkouts */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl p-6 flex flex-col justify-between text-left font-sans animate-[slideLeft_0.25s_ease-out]">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-orange-50 pb-3">
                <h4 className="font-baloo text-lg font-bold text-deep flex items-center gap-2">
                  <ShoppingBag size={18} className="text-primary" />
                  <span>Charity Merch Basket</span>
                </h4>
                <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-2">
                  <ShoppingBag size={40} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Your charity basket is empty.</p>
                  <button 
                    onClick={() => {
                      setCartOpen(false);
                      navigate('/shop');
                    }}
                    className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Browse Merch Products</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[450px] overflow-y-auto no-scrollbar">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-cream/40 p-3 rounded-2xl border border-orange-50 text-xs">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-deep truncate">{item.product.name}</p>
                        <p className="text-primary font-bold">₹ {item.product.price} {item.selectedSize && <span className="text-gray-400 font-mono">({item.selectedSize})</span>}</p>
                        
                        <div className="flex items-center space-x-2 pt-1">
                           <button 
                             onClick={() => updateCartQuantity(item.product.id, item.selectedSize, -1)}
                             className="p-1 bg-white border rounded text-gray-500 hover:bg-orange-50"
                           >
                             <Minus size={10} />
                           </button>
                           <span className="font-bold font-mono text-xs">{item.quantity}</span>
                           <button 
                             onClick={() => updateCartQuantity(item.product.id, item.selectedSize, 1)}
                             className="p-1 bg-white border rounded text-gray-500 hover:bg-orange-50"
                           >
                             <Plus size={10} />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-orange-50 pt-4 space-y-4">
                <div className="flex justify-between items-baseline text-xs font-bold font-sans">
                  <span className="text-gray-500 uppercase tracking-wide">Basket Subtotal:</span>
                  <span className="text-lg text-primary">₹ {getCartTotal().toLocaleString()}</span>
                </div>
                
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  * 100% of final subtotal is credited towards direct street dog medicines. No private logistics cuts. Eligible for standard delivery inside India.
                </p>

                <button 
                  onClick={handleCheckoutCartFromDrawer}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase text-xs tracking-wider font-baloo animate-bounce cursor-pointer text-center"
                >
                  Confirm Charity Bundle Order
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Floating Action Buttons Area (Sticky bottom right) */}
      <div className="fixed bottom-16 right-6 z-20 flex flex-col gap-3 font-sans lg:bottom-6">
        
        {/* Sticky Direct Donate Button */}
        {pathname !== '/donate' && (
          <Link 
            to="/donate"
            className="flex items-center space-x-1.5 bg-[#E8572A] text-white hover:bg-[#D0491E] font-extrabold px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 text-xs select-none cursor-pointer"
          >
            <Heart size={14} className="fill-white animate-pulse" />
            <span>Donate Instantly</span>
          </Link>
        )}

        {/* Floating WhatsApp desk helper */}
        <a 
          href="https://wa.me/918882470000" 
          target="_blank" 
          rel="noreferrer"
          className="bg-[#2E8B57] text-white hover:bg-green-700 rounded-full p-3.5 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          title="Direct WhatsApp Helpdesk Desk"
        >
          <MessageCircle size={22} className="text-white" />
        </a>
      </div>

      {/* Bottom bar mini navigation for seamless tactile response matching India-Specific UI Rules */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFFBF7] border-t border-orange-100 p-2 z-20 flex justify-around items-center font-sans font-bold text-[9px] text-gray-500 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        {[
          { path: '/', label: 'Home', icon: HomeIcon },
          { path: '/adopt', label: 'Adopt', icon: PawPrint },
          { path: '/rescue', label: 'Rescue', icon: ShieldAlert },
          { path: '/donate', label: 'Donate', icon: Heart },
          { path: profile ? '/dashboard' : '/login', label: 'Profile', icon: User }
        ].map(item => {
          const IconComp = item.icon;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all ${pathname === item.path ? 'text-primary bg-orange-50 font-extrabold' : ''}`}
            >
              <IconComp size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
