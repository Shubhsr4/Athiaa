import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertCircle,
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function LoginPage() {
  const { t } = useTranslation();
  const { user, signIn, signUp, resetPassword, updatePassword, loginUser, isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state: 'signin' | 'signup' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Status feedback state
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL params or hash for password recovery
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'reset' || window.location.hash.includes('type=recovery')) {
      setAuthMode('reset');
    }
  }, [searchParams]);

  // Redirect if already authenticated (unless in password reset mode)
  useEffect(() => {
    if (user && authMode !== 'reset') {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, isAdmin, authMode, navigate]);

  // Handle Email + Password Sign In (Email + Password only)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email.trim() || !password) {
      setAuthError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(email.trim(), password);
      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          setAuthError('Your email address is not verified yet. Please check your inbox for the confirmation link before logging in.');
        } else if (error.message?.toLowerCase().includes('invalid login credentials')) {
          setAuthError('Invalid email or password. Please check your credentials and try again.');
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

  // Handle Registration (Full Name, Phone, Email, Password min 8 chars, Confirm Password)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, '').trim();
    const cleanEmail = email.trim();

    // Client-side validations
    if (!cleanFullName) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      setAuthError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long for security.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Passes full_name and phone via options.data so Postgres trigger populates profiles & assigns 'user' role
      const { data, error } = await signUp(cleanEmail, password, {
        full_name: cleanFullName,
        phone: cleanPhone
      });

      if (error) {
        if (error.message?.toLowerCase().includes('user already registered')) {
          setAuthError('An account with this email address already exists. Please sign in instead.');
        } else if (error.message?.toLowerCase().includes('rate limit')) {
          setAuthError('Email rate limit reached. If testing locally, check your Supabase SMTP settings or confirm email configuration.');
        } else {
          setAuthError(error.message || 'Registration failed.');
        }
      } else {
        setAuthSuccess('Registration successful! Please check your email inbox to confirm your account before your first login.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password (Password Recovery)
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
        setAuthError(error.message || 'Failed to send password recovery email.');
      } else {
        setAuthSuccess('Password recovery email dispatched! Click the link in your inbox to set a new password.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Reset password error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Password Reset Update
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setAuthError('New password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setAuthError(error.message || 'Failed to update password.');
      } else {
        setAuthSuccess('Password updated successfully! You can now sign in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setAuthMode('signin'), 1500);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Password update error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-left font-sans space-y-6">
      <div className="bg-white rounded-3xl overflow-hidden shadow-warm border border-orange-50">
        
        {/* Header */}
        <div className="bg-[#1C1C2E] p-6 text-white text-center relative space-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8572A]/20 to-transparent pointer-events-none" />
          <p className="text-2xl font-bold font-baloo">Athiaa Portal Account</p>
          <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
            Secure Supabase Auth with Role-Based Access Control for donors, volunteers, and staff.
          </p>
        </div>

        <div className="p-6 space-y-4">

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
          {authMode !== 'forgot' && authMode !== 'reset' && (
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

          {/* 1. SIGN IN FORM (Email + Password only) */}
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
                    placeholder="e.g. yourname@example.com" 
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
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
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
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Sign In with Email</span>}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM (Full Name, Phone, Email, Password min 8 chars, Confirm Password) */}
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

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Phone Number (10 Digits) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs font-bold">+91</span>
                  <input 
                    type="tel" 
                    required
                    maxLength={10}
                    disabled={isSubmitting}
                    placeholder="9876543210" 
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-12 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. shruti@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Password (Min 8 Characters) *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    placeholder="Create secure password (min 8 chars)" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Confirm Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    placeholder="Confirm secure password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                New accounts automatically receive default <span className="font-bold text-primary font-mono uppercase">User</span> role privileges. Email confirmation is required prior to login.
              </p>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow-sm text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Register & Send Verification Link</span>}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => { setAuthMode('signin'); setAuthError(null); setAuthSuccess(null); }}
                  className="text-gray-400 hover:text-deep flex items-center gap-1 font-bold text-[11px] cursor-pointer"
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
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Send Password Reset Link</span>}
              </button>
            </form>
          )}

          {/* 4. SET NEW PASSWORD FORM (When arriving via recovery link) */}
          {authMode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3 text-xs">
              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">New Password (Min 8 Characters) *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    placeholder="Enter new secure password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="text-[10px] font-bold text-gray-400 uppercase block font-mono">Confirm New Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    disabled={isSubmitting}
                    placeholder="Confirm new secure password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-cream border border-orange-100 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary text-deep"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs font-baloo cursor-pointer shadow-sm text-center flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Update Password & Sign In</span>}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
