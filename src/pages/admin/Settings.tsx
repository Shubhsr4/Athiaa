
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSettings, useSettingsMutation } from '@/lib/hooks/useSettings';
import { useToast } from '@/components/ui/Toast';
import AdminSkeleton from '@/components/ui/AdminSkeleton';
import { Save, Settings, Info, CreditCard, ShieldCheck } from 'lucide-react';

export default function SiteSettingsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { updateSetting } = useSettingsMutation();
  const { toast, showToast } = useToast();

  // Local Form Inputs (mirrors settings schema)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);

  // Sync loaded states
  useEffect(() => {
    if (settings) {
      setTitle(settings.title || '');
      setDescription(settings.description || '');
      setContactEmail(settings.contact_email || '');
      setContactPhone(settings.contact_phone || '');
      setAddress(settings.address || '');
      setStripeEnabled(!!settings.stripe_enabled);
      setRazorpayEnabled(!!settings.razorpay_enabled);
      setPaypalEnabled(!!settings.paypal_enabled);
    }
  }, [settings]);

  if (authLoading || settingsLoading) {
    return <AdminSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleSaveField = async (key: string, value: any, label: string) => {
    try {
      await updateSetting(key, value);
      showToast(`Site configuration "${label}" saved successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || `Failed to update ${label}`, 'error');
    }
  };

  return (
    <div id="settings-console-root" className="max-w-4xl mx-auto px-4 py-12 space-y-8 font-sans text-left">
      {toast}

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <Link to="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <span className="text-gray-600">Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold font-baloo text-slate-800 flex items-center gap-2">
          <Settings size={28} className="text-indigo-650" /> Portal Controls & Configs
        </h1>
        <p className="text-xs text-gray-500">Configure public organizational metadata, default helpline numbers, and payment gateways.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: NGO descriptive variables */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-orange-50 shadow-sm space-y-5">
          <h3 className="font-baloo text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Info size={18} className="text-gray-400" /> Basic Metadata
          </h3>

          {/* Org Title */}
          <div className="space-y-1 block">
            <label className="text-[10px] font-bold text-gray-500 block uppercase">Organization Title</label>
            <div className="flex gap-2">
              <input
                id="setting-title-field"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              />
              <button
                id="save-title-btn"
                onClick={() => handleSaveField('title', title, 'Organization Title')}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs font-baloo cursor-pointer shadow-sm transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* Org Description */}
          <div className="space-y-1 block">
            <label className="text-[10px] font-bold text-gray-500 block uppercase">Portal Meta Description</label>
            <div className="flex gap-2 items-start">
              <textarea
                id="setting-desc-field"
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-202 p-3 rounded-xl text-xs font-semibold text-slate-800 outline-none leading-relaxed"
              />
              <button
                id="save-desc-btn"
                onClick={() => handleSaveField('description', description, 'Meta Description')}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl text-xs font-baloo cursor-pointer shadow-sm transition shrink-0 mt-1"
              >
                Save
              </button>
            </div>
          </div>

          {/* Contact Email */}
          <div className="space-y-1 block">
            <label className="text-[10px] font-bold text-gray-500 block uppercase font-mono">Contact Email</label>
            <div className="flex gap-2">
              <input
                id="setting-email-field"
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-210 p-3 rounded-xl text-xs font-semibold text-slate-800 outline-none font-mono"
              />
              <button
                id="save-email-btn"
                onClick={() => handleSaveField('contact_email', contactEmail, 'Contact Email')}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs font-baloo cursor-pointer shadow-sm transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* Contact Phone */}
          <div className="space-y-1 block">
            <label className="text-[10px] font-bold text-gray-500 block uppercase font-mono">Contact Phone / Helpdesk</label>
            <div className="flex gap-2">
              <input
                id="setting-phone-field"
                type="text"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-210 p-3 rounded-xl text-xs font-semibold text-slate-800 outline-none font-mono"
              />
              <button
                id="save-phone-btn"
                onClick={() => handleSaveField('contact_phone', contactPhone, 'Contact Phone')}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs font-baloo cursor-pointer shadow-sm transition"
              >
                Save
              </button>
            </div>
          </div>

          {/* Venue Address */}
          <div className="space-y-1 block">
            <label className="text-[10px] font-bold text-gray-500 block uppercase">Kennel / NGO HQ Address</label>
            <div className="flex gap-2 items-start">
              <textarea
                id="setting-address-field"
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-205 p-3 rounded-xl text-xs font-medium text-slate-800 outline-none leading-relaxed"
              />
              <button
                id="save-address-btn"
                onClick={() => handleSaveField('address', address, 'Physical Address')}
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl text-xs font-baloo cursor-pointer shadow-sm transition shrink-0 mt-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Merchant integrations checkboxes toggles */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-orange-50 shadow-sm space-y-4 text-left font-sans text-xs">
            <h3 className="font-baloo text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" /> Donation Merchants
            </h3>
            
            <p className="text-[10.5px] text-gray-450 leading-relaxed font-semibold pb-2">
              Select which financial networks are rendered for checkout donation flows. Disable ones currently under system merchant re-audits.
            </p>

            <div className="space-y-3.5 font-bold text-slate-700">
              
              {/* Stripe */}
              <div id="stripe-switch-container" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                <div className="space-y-0.5">
                  <p className="text-slate-800 text-xs font-baloo">Stripe Gateway</p>
                  <p className="text-[10px] text-gray-400 font-medium">Accept global credit cards</p>
                </div>
                <input
                  id="stripe-checkbox"
                  type="checkbox"
                  checked={stripeEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setStripeEnabled(val);
                    handleSaveField('stripe_enabled', val, 'Stripe Gateway Integration');
                  }}
                  className="accent-primary h-4 w-4 shrink-0 cursor-pointer"
                />
              </div>

              {/* Razorpay */}
              <div id="razorpay-switch-container" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                <div className="space-y-0.5">
                  <p className="text-slate-800 text-xs font-baloo">Razorpay UPI</p>
                  <p className="text-[10px] text-gray-400 font-medium">UPI / Netbanking channels</p>
                </div>
                <input
                  id="razorpay-checkbox"
                  type="checkbox"
                  checked={razorpayEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setRazorpayEnabled(val);
                    handleSaveField('razorpay_enabled', val, 'Razorpay Integration');
                  }}
                  className="accent-primary h-4 w-4 shrink-0 cursor-pointer"
                />
              </div>

              {/* PayPal */}
              <div id="paypal-switch-container" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                <div className="space-y-0.5">
                  <p className="text-slate-800 text-xs font-baloo">PayPal Express</p>
                  <p className="text-[10px] text-gray-400 font-medium">Instant conversion payments</p>
                </div>
                <input
                  id="paypal-checkbox"
                  type="checkbox"
                  checked={paypalEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setPaypalEnabled(val);
                    handleSaveField('paypal_enabled', val, 'PayPal express Integration');
                  }}
                  className="accent-primary h-4 w-4 shrink-0 cursor-pointer"
                />
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
