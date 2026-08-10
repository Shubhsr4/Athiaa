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
  LogOut, 
  Menu, 
  X, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useTranslation();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: t('admin.sidebarOverview'), path: '/admin', icon: LayoutDashboard },
    { label: t('admin.sidebarAnimals'), path: '/admin/animals', icon: Dog },
    { label: t('admin.sidebarDonations'), path: '/admin/donations', icon: HeartHandshake },
    { label: t('admin.sidebarVolunteers'), path: '/admin/volunteers', icon: Users },
    { label: t('admin.sidebarAdoptions'), path: '/admin/adoptions', icon: FileCheck2 },
    { label: t('admin.sidebarMessages'), path: '/admin/messages', icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] text-[#1C1C2E] font-sans flex flex-col md:flex-row text-left">
      
      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-[#1C1C2E] text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-baloo font-bold text-white text-sm">
            A
          </div>
          <div>
            <h2 className="font-baloo font-bold text-base leading-tight text-white">Athiaa Admin</h2>
            <p className="text-[9px] text-orange-200 font-mono">NGO OPERATIONAL CONSOLE</p>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* DESKTOP SIDEBAR / MOBILE DRAWER */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1C1C2E] text-white flex flex-col justify-between p-6 transition-transform duration-300 ease-in-out md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          
          {/* BRAND HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-baloo font-extrabold text-white text-lg shadow-md">
                A
              </div>
              <div>
                <h2 className="font-baloo font-bold text-lg leading-tight text-white">Athiaa Console</h2>
                <span className="text-[9px] bg-primary/20 text-orange-300 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </div>
            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
                <X size={20} />
              </button>
            )}
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1 font-sans">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all duration-200
                    ${active 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <IconComp size={18} className={active ? 'text-white' : 'text-orange-300/80'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER & USER ACTION */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
            <p className="text-[10px] text-gray-400 font-mono uppercase">Logged In Administrator</p>
            <p className="text-xs font-bold text-white truncate font-mono">
              {profile?.full_name || user?.phone || user?.email || 'Admin Staff'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <ExternalLink size={14} /> Main Site
            </Link>
            
            <button
              onClick={() => signOut()}
              className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-rose-500/30"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full font-sans">
        {children || <Outlet />}
      </main>

    </div>
  );
}
