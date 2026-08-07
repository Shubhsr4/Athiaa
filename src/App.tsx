import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AppProvider } from '@/components/providers/AppContext';
import LayoutShell from '@/components/LayoutShell';

import Home from './pages/Home';
import About from './pages/About';
import Adopt from './pages/Adopt';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Donate from './pages/Donate';
import Events from './pages/Events';
import Foster from './pages/Foster';
import Login from './pages/Login';
import Rescue from './pages/Rescue';
import Shop from './pages/Shop';
import Stories from './pages/Stories';
import Volunteer from './pages/Volunteer';
import Blog from './pages/Blog';

import AdminDashboard from './pages/admin/AdminDashboard';
import Adoptions from './pages/admin/Adoptions';
import AdminBlog from './pages/admin/Blog';
import Campaigns from './pages/admin/Campaigns';
import Dogs from './pages/admin/Dogs';
import Donations from './pages/admin/Donations';
import AdminEvents from './pages/admin/Events';
import Messages from './pages/admin/Messages';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';
import Volunteers from './pages/admin/Volunteers';

import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LayoutShell>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/adopt" element={<Adopt />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/events" element={<Events />} />
              <Route path="/foster" element={<Foster />} />
              <Route path="/login" element={<Login />} />
              <Route path="/rescue" element={<Rescue />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/success-stories" element={<Stories />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/blog" element={<Blog />} />

              {/* Admin Routes Protected by AdminRoute Guard */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/adoptions" element={<AdminRoute><Adoptions /></AdminRoute>} />
              <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />
              <Route path="/admin/campaigns" element={<AdminRoute><Campaigns /></AdminRoute>} />
              <Route path="/admin/dogs" element={<AdminRoute><Dogs /></AdminRoute>} />
              <Route path="/admin/donations" element={<AdminRoute><Donations /></AdminRoute>} />
              <Route path="/admin/events" element={<AdminRoute><AdminEvents /></AdminRoute>} />
              <Route path="/admin/messages" element={<AdminRoute><Messages /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
              <Route path="/admin/volunteers" element={<AdminRoute><Volunteers /></AdminRoute>} />
            </Routes>
          </LayoutShell>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
