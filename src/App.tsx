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
import Stories from './pages/Stories';
import Volunteer from './pages/Volunteer';

import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AnimalsAdmin from './pages/admin/AnimalsAdmin';
import DonationsAdmin from './pages/admin/DonationsAdmin';
import VolunteersAdmin from './pages/admin/VolunteersAdmin';
import AdoptionsAdmin from './pages/admin/AdoptionsAdmin';
import MessagesAdmin from './pages/admin/MessagesAdmin';
import Campaigns from './pages/admin/Campaigns';
import AdminBlog from './pages/admin/Blog';
import AdminEvents from './pages/admin/Events';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LayoutShell>
            <Routes>
              {/* Public Routes */}
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
              <Route path="/success-stories" element={<Stories />} />
              <Route path="/volunteer" element={<Volunteer />} />

              {/* Admin Console Routes Protected by AdminRoute & AdminLayout */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="animals" element={<AnimalsAdmin />} />
                <Route path="dogs" element={<AnimalsAdmin />} />
                <Route path="donations" element={<DonationsAdmin />} />
                <Route path="volunteers" element={<VolunteersAdmin />} />
                <Route path="adoptions" element={<AdoptionsAdmin />} />
                <Route path="messages" element={<MessagesAdmin />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="settings" element={<Settings />} />
                <Route path="users" element={<Users />} />
              </Route>
            </Routes>
          </LayoutShell>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
