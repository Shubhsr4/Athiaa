import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AppProvider } from '@/components/providers/AppContext';
import LayoutShell from '@/components/LayoutShell';
import { Loader2 } from 'lucide-react';

// Code-split all routes with React.lazy
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Adopt = lazy(() => import('./pages/Adopt'));
const Contact = lazy(() => import('./pages/Contact'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Donate = lazy(() => import('./pages/Donate'));
const Events = lazy(() => import('./pages/Events'));
const Foster = lazy(() => import('./pages/Foster'));
const Login = lazy(() => import('./pages/Login'));
const Rescue = lazy(() => import('./pages/Rescue'));
const Stories = lazy(() => import('./pages/Stories'));
const Volunteer = lazy(() => import('./pages/Volunteer'));

const AdminRoute = lazy(() => import('./components/AdminRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AnimalsAdmin = lazy(() => import('./pages/admin/AnimalsAdmin'));
const DonationsAdmin = lazy(() => import('./pages/admin/DonationsAdmin'));
const VolunteersAdmin = lazy(() => import('./pages/admin/VolunteersAdmin'));
const AdoptionsAdmin = lazy(() => import('./pages/admin/AdoptionsAdmin'));
const MessagesAdmin = lazy(() => import('./pages/admin/MessagesAdmin'));
const Campaigns = lazy(() => import('./pages/admin/Campaigns'));
const AdminBlog = lazy(() => import('./pages/admin/Blog'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Users = lazy(() => import('./pages/admin/Users'));

function PageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-primary opacity-60" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LayoutShell>
            <Suspense fallback={<PageFallback />}>
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
            </Suspense>
          </LayoutShell>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
