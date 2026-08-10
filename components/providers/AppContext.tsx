
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dog, ShopProduct, AdoptionApplication } from '@/src/types';
import { SWRConfig } from 'swr';

interface AppContextType {
  language: 'EN' | 'HI';
  setLanguage: (lang: 'EN' | 'HI') => void;
  cartItems: { product: ShopProduct; quantity: number; selectedSize?: string }[];
  setCartItems: React.Dispatch<React.SetStateAction<{ product: ShopProduct; quantity: number; selectedSize?: string }[]>>;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  loaderState: { isVisible: boolean; title: string; subtext: string };
  setLoaderState: React.Dispatch<React.SetStateAction<{ isVisible: boolean; title: string; subtext: string }>>;
  triggerAppletActionLoader: (title: string, subtext: string, callback?: () => void) => void;
  favoriteDogs: Dog[];
  setFavoriteDogs: React.Dispatch<React.SetStateAction<Dog[]>>;
  handleToggleFavorite: (dog: Dog) => void;
  selectedDogForProfile: Dog | null;
  setSelectedDogForProfile: (dog: Dog | null) => void;
  cumulativeDonations: number;
  setCumulativeDonations: React.Dispatch<React.SetStateAction<number>>;
  addToCart: (prod: ShopProduct, size?: string) => void;
  updateCartQuantity: (prodId: string, size: string | undefined, delta: number) => void;
  getCartTotal: () => number;
  adoptionApplications: AdoptionApplication[];
  setAdoptionApplications: React.Dispatch<React.SetStateAction<AdoptionApplication[]>>;
  fosterRecords: any[];
  setFosterRecords: React.Dispatch<React.SetStateAction<any[]>>;
  donationHistory: any[];
  setDonationHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const language = i18n.language?.toLowerCase().startsWith('hi') ? 'HI' : 'EN';
  const setLanguage = (lang: 'EN' | 'HI') => {
    i18n.changeLanguage(lang.toLowerCase());
  };
  const [cartItems, setCartItems] = useState<{ product: ShopProduct; quantity: number; selectedSize?: string }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedDogForProfile, setSelectedDogForProfile] = useState<Dog | null>(null);
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const [cumulativeDonations, setCumulativeDonations] = useState<number>(342850);
  const [adoptionApplications, setAdoptionApplications] = useState<AdoptionApplication[]>([]);
  const [fosterRecords, setFosterRecords] = useState<any[]>([]);
  const [donationHistory, setDonationHistory] = useState<any[]>([]);

  const [loaderState, setLoaderState] = useState({
    isVisible: true,
    title: 'Nurturing Street Angels',
    subtext: 'Booting Athiaa National Resource Registry...'
  });

  // Auto Dismiss Initial Intro Loader after 1.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaderState(prev => ({ ...prev, isVisible: false }));
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const triggerAppletActionLoader = (title: string, subtext: string, callback?: () => void) => {
    setLoaderState({ isVisible: true, title, subtext });
    setTimeout(() => {
      setLoaderState(prev => ({ ...prev, isVisible: false }));
      if (callback) callback();
    }, 1650);
  };

  const handleToggleFavorite = (dog: Dog) => {
    setFavoriteDogs(prev => {
      const exists = prev.find(d => d.id === dog.id);
      if (exists) {
        return prev.filter(d => d.id !== dog.id);
      } else {
        return [...prev, dog];
      }
    });
  };

  const addToCart = (prod: ShopProduct, size?: string) => {
    setCartItems(prev => {
      const match = prev.find(item => item.product.id === prod.id && item.selectedSize === size);
      if (match) {
        return prev.map(item => 
          item.product.id === prod.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product: prod, quantity: 1, selectedSize: size }];
    });
  };

  const updateCartQuantity = (prodId: string, size: string | undefined, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === prodId && item.selectedSize === size) {
        const nextQ = item.quantity + delta;
        return { ...item, quantity: nextQ > 0 ? nextQ : 0 };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  };

  return (
    <SWRConfig value={{
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      onError: (error) => console.error('SWR Error:', error)
    }}>
      <AppContext.Provider
        value={{
          language,
          setLanguage,
          cartItems,
          setCartItems,
          cartOpen,
          setCartOpen,
          loaderState,
          setLoaderState,
          triggerAppletActionLoader,
          favoriteDogs,
          setFavoriteDogs,
          handleToggleFavorite,
          selectedDogForProfile,
          setSelectedDogForProfile,
          cumulativeDonations,
          setCumulativeDonations,
          addToCart,
          updateCartQuantity,
          getCartTotal,
          adoptionApplications,
          setAdoptionApplications,
          fosterRecords,
          setFosterRecords,
          donationHistory,
          setDonationHistory
        }}
      >
        {children}
      </AppContext.Provider>
    </SWRConfig>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
