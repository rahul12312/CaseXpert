import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/Navbar.jsx';
import FooterModern from './components/FooterModern.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BackButton from './components/BackButton.jsx';
import VideoNotificationListener from './components/VideoNotificationListener.jsx';

// Public Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import LawyerMarketplace from './pages/LawyerMarketplace.jsx';
import LawyerMarketplaceWithMap from './pages/LawyerMarketplaceWithMap.jsx';
import LawyerProfile from './pages/LawyerProfile.jsx';
import NewsHub from './pages/NewsHub.jsx';
import Blog from './pages/Blog.jsx';

// Private Pages - Common
import Profile from './pages/Profile.jsx';
import Messages from './pages/Messages.jsx';
import DocumentAnalyzer from './pages/DocumentAnalyzer.jsx';

// Private Pages - Client
import CaseTracker from './pages/CaseTracker.jsx';
import DocumentDrafting from './pages/DocumentDrafting.jsx';
import ReportsDashboard from './pages/ReportsDashboard.jsx';
import UserBookings from './pages/UserBookings.jsx';
import AIInsights from './pages/AIInsights.jsx';
import VideoHub from './pages/VideoHub.jsx';
import VideoConsultation from './pages/VideoConsultation.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';

// Footer Pages
import AboutUs from './pages/AboutUs.jsx';
import LegalPage from './pages/LegalPage.jsx';
import Contact from './pages/Contact.jsx';
import Careers from './pages/Careers.jsx';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard.jsx';

// Lawyer Pages
import LawyerDashboard from './pages/LawyerDashboard.jsx';
import LawyerConsultations from './pages/LawyerConsultations.jsx';

// AI Assistant
import AILegalAssistantChat from './pages/AILegalAssistantChat.jsx';

const App = () => {
  const location = useLocation();

  // Logic from Ajay Tipte: Identify "Feature Pages" to hide Global UI (Navbar/Footer)
  const isFeaturePage = 
    location.pathname.startsWith('/assistant') ||
    location.pathname.startsWith('/lawyers') ||
    location.pathname.startsWith('/cases') ||
    location.pathname.startsWith('/documents') ||
    location.pathname.startsWith('/reports') ||
    location.pathname.startsWith('/bookings') ||
    location.pathname.startsWith('/my-bookings') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/news') ||
    location.pathname.startsWith('/video-hub') ||
    location.pathname.startsWith('/consultation') ||
    location.pathname.startsWith('/insights') ||
    location.pathname.startsWith('/lawyer/dashboard') ||
    location.pathname.startsWith('/admin/dashboard') ||
    location.pathname === '/dashboard';

  const hideFooter = isFeaturePage;
  const hideNavbar = location.pathname.startsWith('/assistant') || location.pathname.startsWith('/consultation');
  const fullScreen = hideNavbar;

  return (
    <div className={`flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden`}>
      <Toaster position="top-center" reverseOrder={false} />
      <VideoNotificationListener />
      {!hideNavbar && <Navbar />}
      <main className={`flex flex-1 flex-col ${!fullScreen ? 'pt-24 pb-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl px-4' : 'pt-0 w-full px-0 overflow-hidden'}`}>
        {!fullScreen && <BackButton />}
        <Routes>
          {/* ── PUBLIC ROUTES (no login required) ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/lawyers" element={<LawyerMarketplace />} />
          <Route path="/lawyers-map" element={<LawyerMarketplaceWithMap />} />
          <Route path="/lawyers/:id" element={<LawyerProfile />} />
          <Route path="/lawyer/:id" element={<LawyerProfile />} />
          <Route path="/news" element={<NewsHub />} />

          {/* Static Content */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/legal/:type" element={<LegalPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />

          {/* ── PROTECTED ROUTES (Login Required) ── */}
          
          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/document-analyzer" element={<ProtectedRoute><DocumentAnalyzer /></ProtectedRoute>} />

          {/* Case Tracking Routes - Client Only */}
          <Route path="/cases" element={<ProtectedRoute allowedRoles={['client', 'user']}><CaseTracker /></ProtectedRoute>} />
          
          {/* Document Management - Client Only */}
          <Route path="/documents" element={<ProtectedRoute allowedRoles={['client', 'user']}><DocumentDrafting /></ProtectedRoute>} />
          
          {/* Reports & Analytics - Client Only */}
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['client', 'user']}><ReportsDashboard /></ProtectedRoute>} />
          
          {/* Bookings - Client Only */}
          <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['client', 'user']}><UserBookings /></ProtectedRoute>} />
          
          {/* AI Insights - Client Only */}
          <Route path="/insights" element={<ProtectedRoute allowedRoles={['client', 'user']}><AIInsights /></ProtectedRoute>} />

          {/* Video Hub / Consultations */}
          <Route path="/video-hub" element={<ProtectedRoute><VideoHub /></ProtectedRoute>} />
          <Route path="/consultation/:roomId" element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>} />
          
          {/* Client Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['client', 'user']}><ClientDashboard /></ProtectedRoute>} />

          {/* ── ADMIN ROUTES ── */}
          <Route 
            path="/admin/dashboard" 
            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
          />

          {/* ── LAWYER ROUTES ── */}
          <Route 
            path="/lawyer/dashboard" 
            element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/lawyer/consultations" 
            element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerConsultations /></ProtectedRoute>} 
          />

          {/* AI Assistant - Accessible to all logged in users */}
          <Route path="/assistant" element={<ProtectedRoute><AILegalAssistantChat /></ProtectedRoute>} />
        </Routes>
      </main>
      {!hideFooter && <FooterModern />}
    </div>
  );
};

export default App;
