import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  User,
  MapPin,
  CheckCircle2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, signIn, signUp, resetPassword, loginUser, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  // Mode state: 'signin' | 'signup' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Delhi NCR');

  // Status feedback state
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, isAdmin, navigate]);

  // Handle Email + Password Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(email.trim(), password);
      if (error) {
        if (error.message?.includes('Email not confirmed')) {
          setAuthError('Your email address is not verified yet. Please check your inbox for the confirmation link.');
        } else {
          setAuthError(error.message || 'Invalid email or password.');
        }
      } else if (data?.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email + Password Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !fullName.trim()) {
      setAuthError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        city: city
      });

      if (error) {
        if (error.message?.toLowerCase().includes('rate limit')) {
          setAuthError('Supabase default email SMTP rate limit reached (max 3 confirmation emails/hr). To test sign-ups freely: in Supabase Dashboard go to Authentication -> Providers -> Email -> turn OFF "Confirm email". Or use Instant Demo Admin Sign-In below.');
        } else {
          setAuthError(error.message || 'Sign up failed.');
        }
      } else {
        setAuthSuccess('Account created successfully! If email confirmation is enabled, check your inbox. Otherwise, you can sign in directly!');
        setEmail('');
        setPassword('');
        setFullName('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Sign up error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setAuthError('Please enter your registered email address.');
      return;
    }

    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setAuthError(error.message || 'Failed to send password reset email.');
      } else {
        setAuthSuccess('Password reset link sent! Please check your email inbox.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Reset password error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Admin quick sign-in helper
  const handleDemoAdminLogin = () => {
    loginUser({
      uid: `admin-demo-${Date.now()}`,
      name: 'Demo Administrator',
      email: 'admin@athiaa.org',
      city: 'Delhi NCR',
      role: 'Admin'
    });
    navigate('/admin');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-left font-sans space-y-6">
      <div className="bg-white rounded-3xl overflow-hidden shadow-warm border border-orange-50">
        
        {/* Header */}
        <div className="bg-[#1C1C2E] p-6 text-white text-center relative space-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8572A]/20 to-transparent pointer-events-none" />
          <p className="text-2xl font-bold font-baloo">Athiaa Portal Account</p>
          <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
            JWT email authentication & role portal for donors, volunteers, rescuers, and staff.
          </p>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Quick Demo Admin Banner */}
          <div className="bg-gradient-to-r from-[#E8572A] to-amber-500 p-4 rounded-2xl text-white shadow-warm space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-extrabold uppercase tracking-wider font-mono bg-white/20 px-2 py-0.5 rounded-md">
                ⚡ DEMO ADMIN ACCESS
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-100">Role: Administrator</span>
            </div>
            <div>
              <h4 className="font-baloo text-base font-bold leading-tight">Instant Demo Admin Login</h4>
              <p className="text-[11px] text-orange-100 mt-0.5 leading-snug">
                Overview the NGO operations console, volunteer roster, adoptions, and rescue dispatch.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              className="w-full bg-white hover:bg-orange-50 text-[#E8572A] font-extrabold py-2.5 rounded-xl text-xs shadow transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck size={16} className="text-[#E8572A]" />
              <span>Sign In as Demo Admin</span>
            </button>
          </div>

          {/* Feedback messages */}
          {authError && (
            <div className="bg-rose-50 text-rose-800 p-3.5 rounded-2xl border border-rose-200 flex items-start gap-2 text-xs font-semibold leading-relaxed">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl border border-emerald-200 flex items-start gap-2 text-xs font-semibold leading-relaxed">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Mode Selector Tabs (Sign In / Sign Up) */}
          {authMode !== 'forgot' && (
            <div className="flex bg-cream p-1 rounded-xl border border-orange-100">
              <button 
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold cursor-pointer transition ${authMode === 'signin' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-deep'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthSuccess(null); }}
                className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold cursor-pointer transition ${authMode === 'signup' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-deep'}`}
              >
                New Account
              </button>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-3 text-xs">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. donor@athiaa.org" 
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Password *</label>
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('forgot'); setAuthError(null); setAuthSuccess(null); }}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    disabled={isSubmitting}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter account password" 
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow-sm text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Sign In to Account</span>}
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Full Name *</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Shruti Sen" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1 block">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Email Address *</label>
                  <input 
                    type="email" 
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. name@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
                <div className="space-y-1 block">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Preferred City</label>
                  <select 
                    value={city}
                    disabled={isSubmitting}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl p-3 text-xs text-deep outline-none focus:border-primary font-bold"
                  >
                    <option>Delhi NCR</option>
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Pune</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Password (Min 6 chars) *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    disabled={isSubmitting}
                    placeholder="Create secure password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                By signing up, you will automatically be assigned default <span className="font-bold text-primary font-mono uppercase">Donor</span> role privileges.
              </p>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow-sm text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Create Account & Send Verification</span>}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthSuccess(null); }}
                  className="text-gray-400 hover:text-deep flex items-center gap-1 font-bold text-[11px]"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Registered Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com" 
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow-sm text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Send Password Reset Email</span>}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
