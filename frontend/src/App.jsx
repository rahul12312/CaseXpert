import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import FooterModern from './components/FooterModern.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import BackButton from './components/BackButton.jsx';
import { Toaster } from 'react-hot-toast';
import VideoNotificationListener from './components/VideoNotificationListener.jsx';
import Home from './pages/Home.jsx';
import AILegalAssistant from './pages/AILegalAssistant.jsx';
import AILegalAssistantNew from './pages/AILegalAssistantNew.jsx';
import AILegalAssistantImproved from './pages/AILegalAssistantImproved.jsx';
import AILegalAssistantChat from './pages/AILegalAssistantChat.jsx';
import LegalAssistant from './pages/LegalAssistant.jsx';
import LawyerFinder from './pages/LawyerFinder.jsx';
import LawyerMarketplace from './pages/LawyerMarketplace.jsx';
import LawyerProfile from './pages/LawyerProfile.jsx';
import DocumentDrafting from './pages/DocumentDrafting.jsx';
// Case Management
import CaseTracker from './pages/CaseTracker.jsx';
import CreateCase from './pages/CreateCase.jsx';
import CaseDetails from './pages/CaseDetails.jsx';

import VideoConsultation from './pages/VideoConsultation.jsx';
import NewsHub from './pages/NewsHub.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ReportsDashboard from './pages/ReportsDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import CaseIntelligenceReport from './pages/CaseIntelligenceReport.jsx';
import GenerateCaseReport from './pages/GenerateCaseReport.jsx';
import UserBookings from './pages/UserBookings.jsx';
import AIInsights from './pages/AIInsights.jsx';
import VideoHub from './pages/VideoHub.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import Messages from './pages/Messages.jsx';
import DocumentAnalyzer from './pages/DocumentAnalyzer.jsx';

// Footer Pages
import AboutUs from './pages/AboutUs.jsx';
import Contact from './pages/Contact.jsx';
import Careers from './pages/Careers.jsx';
import Blog from './pages/Blog.jsx';
import LegalPage from './pages/LegalPage.jsx';

// Lawyer Dashboard Pages
import LawyerDashboard from './pages/LawyerDashboard.jsx';
import LawyerAcceptedCases from './pages/LawyerAcceptedCases.jsx';
import LawyerClientQueries from './pages/LawyerClientQueries.jsx';
import LawyerCaseRequests from './pages/LawyerCaseRequests.jsx';
import LawyerConsultations from './pages/LawyerConsultations.jsx';

const App = () => {
  const location = useLocation();
  const isClientDashboard = location.pathname === '/dashboard';
  const isConsultation = location.pathname.includes('consultation');
  const hideGlobalUI = isClientDashboard || isConsultation;

  return (
    <div className={`flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden`}>
      <Toaster position="top-center" reverseOrder={false} />
      <VideoNotificationListener />
      {!hideGlobalUI && <Navbar />}
      <main className={`flex flex-1 flex-col ${!hideGlobalUI ? 'pt-24 pb-8 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl px-4' : 'pt-0 w-full px-0 overflow-hidden'}`}>
        {!hideGlobalUI && <BackButton />}
        <Routes>
          {/* ── PUBLIC ROUTES (no login required) ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home & informational pages are public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/legal/:type" element={<LegalPage />} />
          {/* ── PROTECTED: Feature Routes (login required) ── */}
          <Route path="/assistant" element={<ProtectedRoute><AILegalAssistantChat /></ProtectedRoute>} />
          <Route path="/assistant-improved" element={<ProtectedRoute><AILegalAssistantImproved /></ProtectedRoute>} />
          <Route path="/assistant-simple" element={<ProtectedRoute><AILegalAssistantNew /></ProtectedRoute>} />
          <Route path="/assistant-old" element={<ProtectedRoute><AILegalAssistant /></ProtectedRoute>} />
          <Route path="/assistant-legacy" element={<ProtectedRoute><LegalAssistant /></ProtectedRoute>} />
          <Route path="/lawyers" element={<ProtectedRoute><LawyerMarketplace /></ProtectedRoute>} />
          <Route path="/lawyer/:id" element={<ProtectedRoute><LawyerProfile /></ProtectedRoute>} />
          <Route path="/lawyers-old" element={<ProtectedRoute><LawyerFinder /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><DocumentDrafting /></ProtectedRoute>} />
          <Route path="/news" element={<ProtectedRoute><NewsHub /></ProtectedRoute>} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['client', 'user']}><ClientDashboard /></ProtectedRoute>} />

          {/* Profile */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/document-analyzer" element={<ProtectedRoute><DocumentAnalyzer /></ProtectedRoute>} />

          {/* Case Tracking Routes - Client Only */}
          <Route path="/cases" element={<ProtectedRoute allowedRoles={['client', 'user']}><CaseTracker /></ProtectedRoute>} />
          <Route path="/cases/create" element={<ProtectedRoute allowedRoles={['client', 'user']}><CreateCase /></ProtectedRoute>} />
          <Route path="/cases/:id" element={<ProtectedRoute allowedRoles={['client', 'user', 'lawyer']}><CaseDetails /></ProtectedRoute>} />

          {/* Reports */}
          <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
          <Route path="/reports/intelligence/:id" element={<ProtectedRoute><CaseIntelligenceReport /></ProtectedRoute>} />
          <Route path="/cases/:id/generate-report" element={<ProtectedRoute><GenerateCaseReport /></ProtectedRoute>} />

          {/* Bookings */}
          <Route path="/bookings" element={<ProtectedRoute><UserBookings /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><UserBookings /></ProtectedRoute>} />

          {/* Consultation */}
          <Route path="/video-hub" element={<ProtectedRoute><VideoHub /></ProtectedRoute>} />
          <Route path="/consultation/:roomId" element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>} />
          <Route path="/consultation" element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>} />

          {/* Insights */}
          <Route path="/insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />

          {/* ── PROTECTED: Lawyer-Only Routes ── */}
          <Route path="/lawyer/dashboard" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerDashboard /></ProtectedRoute>} />
          <Route path="/lawyer/accepted-cases" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerAcceptedCases /></ProtectedRoute>} />
          <Route path="/lawyer/client-queries" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerClientQueries /></ProtectedRoute>} />
          <Route path="/lawyer/case-requests" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerCaseRequests /></ProtectedRoute>} />
          <Route path="/lawyer/consultations" element={<ProtectedRoute allowedRoles={['lawyer']}><LawyerConsultations /></ProtectedRoute>} />

          {/* ── PROTECTED: Admin-Only Routes ── */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route
            path="*"
            element={
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  The page you are looking for does not exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
      {!hideGlobalUI && <FooterModern />}
    </div>
  );
};

export default App;
