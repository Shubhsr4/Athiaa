import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  LayoutDashboard, 
  Dog, 
  HeartHandshake, 
  Users, 
  FileCheck2, 
  MessageSquare, 
  Flag,
  Calendar,
  BookOpen,
  Settings,
  Shield,
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNavItems = [
    { label: t('admin.sidebarOverview') || 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: t('admin.sidebarAnimals') || 'Animals & Rescues', path: '/admin/animals', icon: Dog },
    { label: t('admin.sidebarDonations') || 'Donations & 80G', path: '/admin/donations', icon: HeartHandshake },
    { label: t('admin.sidebarAdoptions') || 'Adoption Requests', path: '/admin/adoptions', icon: FileCheck2 },
    { label: t('admin.sidebarVolunteers') || 'Volunteers Roster', path: '/admin/volunteers', icon: Users },
    { label: t('admin.sidebarMessages') || 'Inquiries & Contact', path: '/admin/messages', icon: MessageSquare },
  ];

  const secondaryNavItems = [
    { label: 'Campaigns', path: '/admin/campaigns', icon: Flag },
    { label: 'Events & Drives', path: '/admin/events', icon: Calendar },
    { label: 'Stories & Blog', path: '/admin/blog', icon: BookOpen },
    { label: 'Users & Roles', path: '/admin/users', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1C1C2E] font-sans flex flex-col md:flex-row text-left">
      
      {/* ────────────────────────────────────────────────────────
          A. MOBILE TOP BAR (Exclusively rendered on < md screens)
          ──────────────────────────────────────────────────────── */}
      <div className="md:hidden bg-[#1C1C2E] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#E8572A] to-[#F4C430] rounded-xl flex items-center justify-center p-1 shadow-xs">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M78.6,35.4c-1.3-1.6-4.2-2.1-5.6-0.7L62.1,45.6c-1.5,1.5-2,3.8-1.4,5.8l2,6.5c0.5,1.7,2.2,2.8,4,2.5l7.1-1.3c2-0.4,3.3-2.1,3.2-4.1l-0.3-6.6C76.6,39.5,79.8,36.8,78.6,35.4z" />
              <path d="M49.8,40.1c1.5-3.5,6.5-1.5,5.1,2c-1.1,2.7-3.6,1.4-5.1-2z" />
              <circle cx="58" cy="45" r="4" fill="#1c1c2e" />
              <path d="M25,65 L35,55 L45,65 Z" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <h2 className="font-baloo font-bold text-sm leading-tight text-white">Athiaa Admin</h2>
            <p className="text-[9px] text-amber-300 font-mono font-bold tracking-wider">OPERATIONS CONSOLE</p>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition active:scale-95"
          aria-label="Toggle navigation drawer"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          B. DESKTOP SIDEBAR / MOBILE SLIDE-OVER DRAWER
          ──────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1C1C2E] text-white flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out md:static md:translate-x-0 shadow-xl md:shadow-none
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* SINGLE BRAND HEADER (Desktop) */}
          <div className="hidden md:flex items-center justify-between pb-4 border-b border-white/10">
            <Link to="/admin" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#E8572A] to-[#F4C430] rounded-2xl flex items-center justify-center p-1.5 shadow-md transform group-hover:scale-105 transition">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M78.6,35.4c-1.3-1.6-4.2-2.1-5.6-0.7L62.1,45.6c-1.5,1.5-2,3.8-1.4,5.8l2,6.5c0.5,1.7,2.2,2.8,4,2.5l7.1-1.3c2-0.4,3.3-2.1,3.2-4.1l-0.3-6.6C76.6,39.5,79.8,36.8,78.6,35.4z" />
                  <path d="M49.8,40.1c1.5-3.5,6.5-1.5,5.1,2c-1.1,2.7-3.6,1.4-5.1-2z" />
                  <circle cx="58" cy="45" r="4" fill="#1c1c2e" />
                  <path d="M25,65 L35,55 L45,65 Z" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <h2 className="font-baloo font-bold text-lg leading-tight text-white">Athiaa Console</h2>
                <span className="text-[9px] bg-primary/30 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Close button on mobile drawer */}
          <div className="md:hidden flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold font-mono text-gray-400 uppercase tracking-wider">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          {/* SECTION 1: CORE OPERATIONS */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">
              Operations
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const IconComp = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200
                      ${active 
                        ? 'bg-primary text-white shadow-md font-extrabold' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <IconComp size={16} className={active ? 'text-white' : 'text-amber-400/80'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* SECTION 2: PLATFORM & COMMUNITY */}
          <div className="space-y-1 pt-2">
            <p className="px-3 text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">
              Management
            </p>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const IconComp = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-200
                      ${active 
                        ? 'bg-primary text-white shadow-md font-extrabold' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <IconComp size={16} className={active ? 'text-white' : 'text-amber-400/80'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* FOOTER & SESSION CONTROL */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-gray-400 font-mono uppercase">Active Admin</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs font-bold text-white truncate font-mono">
              {profile?.full_name || user?.email || 'Administrator'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <ExternalLink size={13} /> Return to Public Site
            </Link>
            
            <button
              onClick={() => signOut()}
              className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-rose-500/30"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────
          C. MAIN CONTENT VIEWPORT
          ──────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full font-sans overflow-x-hidden">
        {children || <Outlet />}
      </main>

      {/* Overlay backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

    </div>
  );
}
