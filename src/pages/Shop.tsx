
import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ShopProduct } from '@/src/types';
import { useAppContext } from '@/components/providers/AppContext';

const INITIAL_PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-1',
    name: '"Har Panje Mein Ek Kahani" Premium Tee',
    price: 499,
    description: '100% organic cotton, breathable fabric ideal for Indian summers. Features our tagline and bindi-heart handprinted logo.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=500',
    category: 'T-shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    isCODSupported: true
  },
  {
    id: 'prod-2',
    name: 'Saffron Indie-Dog Canvas Tote',
    price: 299,
    description: 'Heavyweight canvas tote bag, perfect for grocery shopping, college, or dog park essentials. Spot clean only.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=500',
    category: 'Tote bags',
    isCODSupported: true
  },
  {
    id: 'prod-3',
    name: 'Aathia Ceramic Coffee Mug',
    price: 249,
    description: 'Warm cream glaze ceramic coffee mug with hand-pressed paw relief details in Deep Saffron color. Microwave safe.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=500',
    category: 'Mugs',
    isCODSupported: true
  },
  {
    id: 'prod-4',
    name: 'Turmeric Yellow Desi Bandana',
    price: 199,
    description: 'Adjustable, premium cotton canine bandana with traditional batik print patterns. Hand-wash separately.',
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=500',
    category: 'Bandanas',
    sizes: ['Small (Puppy)', 'Medium', 'Large'],
    isCODSupported: true
  },
  {
    id: 'prod-5',
    name: 'Gift a Rescue Kit (Sponsored)',
    price: 750,
    description: 'Directly sponsors a high-quality stainless steel feeding bowl, a solid leash with reflective stitching, and an anti-tick grooming bar for a newly arrived rescue stray. You will receive a digital certificate.',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=500',
    category: 'Gifts',
    isCODSupported: false
  }
];

export default function ShopPage() {
  const { addToCart: onAddToCart } = useAppContext();

  const [shopCategory, setShopCategory] = useState<'All' | 'T-shirts' | 'Tote bags' | 'Mugs' | 'Bandanas'>('All');
  const [pinCodeCheck, setPinCodeCheck] = useState('');
  const [pinCodeResult, setPinCodeResult] = useState<null | { ok: boolean; desc: string }>(null);
  const [selectedSizeForProd, setSelectedSizeForProd] = useState<Record<string, string>>({});

  // Filter products by category
  const filteredProducts = INITIAL_PRODUCTS.filter(p => shopCategory === 'All' || p.category === shopCategory);

  // India Pincode eligibility checker for shipping
  const handlePincodeVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCodeCheck.length !== 6) {
      setPinCodeResult({ ok: false, desc: 'Pincode must be 6 digits length' });
      return;
    }
    
    const firstDigit = pinCodeCheck[0];
    if (['4', '5', '1', '3'].includes(firstDigit)) {
      setPinCodeResult({ ok: true, desc: 'Delivery Serviceable! COD payment supported.' });
    } else {
      setPinCodeResult({ ok: false, desc: 'Remote partner delivery only. No COD.' });
    }
  };

  return (
    <div id="aathia-shop-view" className="max-w-7xl mx-auto px-4 py-16 relative space-y-12 text-left font-sans">
      <div className="text-center space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-sm font-mono block">100% Proceeds Support Stray Rescue Vets</span>
        <h1 className="text-3xl md:text-5xl font-bold font-baloo text-deep">Aathia Charity Merch Shop</h1>
        <p className="text-gray-600 max-w-xl mx-auto text-sm leading-relaxed">
          Look stylish while protecting street strays! 100% of the proceeds generated directly finances ambulance fuels, surgical stitches and puppy meal bowls.
        </p>
      </div>

      {/* Quick shop category filters + pincode checker */}
      <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-warm flex flex-col md:flex-row justify-between items-center gap-6 text-left">
        
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {(['All', 'T-shirts', 'Tote bags', 'Mugs', 'Bandanas'] as const).map((cat) => (
            <button 
              key={cat}
              onClick={() => setShopCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${shopCategory === cat ? 'bg-primary text-white shadow-sm' : 'bg-cream text-gray-500 hover:bg-orange-50/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pincode checker */}
        <form onSubmit={handlePincodeVerify} className="flex gap-2 text-xs font-sans items-start">
          <div className="space-y-1 text-left">
            <input 
              type="text" 
              maxLength={6}
              required
              placeholder="Indian ZIP (e.g., 400012)" 
              value={pinCodeCheck}
              onChange={e => setPinCodeCheck(e.target.value.replace(/\D/g, ''))}
              className="bg-cream border border-orange-50 rounded-lg py-2.5 px-3 text-xs w-44 focus:outline-none focus:border-primary font-mono text-deep font-semibold"
            />
            {pinCodeResult && (
              <p className={`text-[10px] font-bold ${pinCodeResult.ok ? 'text-accent' : 'text-red-500'}`}>
                {pinCodeResult.desc}
              </p>
            )}
          </div>
          <button type="submit" className="bg-deep hover:bg-slate-900 text-white px-4 py-3 rounded-lg text-xs leading-none cursor-pointer font-bold">Verify Serviceability</button>
        </form>
      </div>

      {/* Products Grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 font-sans text-xs">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-orange-50 shadow-sm hover:shadow-warm transition duration-200 flex flex-col justify-between group">
            <div className="relative aspect-square">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-102 transition duration-300" referrerPolicy="no-referrer" />
              <span className="absolute bottom-3 left-3 bg-white px-2 py-0.5 text-[9px] text-[#2E8B57] border border-green-200 font-bold rounded-lg uppercase font-mono">Proceeds Fund Dogs</span>
            </div>

            <div className="p-4 space-y-3 text-left">
              <h4 className="font-bold text-deep text-sm line-clamp-1">{p.name}</h4>
              <p className="text-xs text-primary font-bold font-mono">₹ {p.price}</p>
              <p className="text-gray-500 text-[10px] leading-relaxed line-clamp-2">{p.description}</p>
              
              {p.sizes && (
                <div className="flex gap-1.5 items-center">
                  <span className="text-[9px] text-gray-400 font-bold uppercase font-mono">Size:</span>
                  {p.sizes.map(sz => (
                    <button 
                      key={sz}
                      type="button" 
                      onClick={() => setSelectedSizeForProd(prev => ({ ...prev, [p.id]: sz }))}
                      className={`px-2 py-0.5 border text-[9px] rounded font-mono font-bold cursor-pointer transition ${selectedSizeForProd[p.id] === sz ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:bg-cream'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              )}

              <button 
                onClick={() => {
                  if (p.sizes && !selectedSizeForProd[p.id]) {
                    alert("Please select a size first!");
                    return;
                  }
                  onAddToCart(p, selectedSizeForProd[p.id]);
                  alert(`"${p.name}" added to shopping basket! Open cart drawer.`);
                }}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl text-xs uppercase cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <ShoppingBag size={12} />
                <span>Add to Charity Basket</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
