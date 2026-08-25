import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssistantPage } from './pages/AssistantPage';
import { UploadPage } from './pages/UploadPage';
import { SummariesPage } from './pages/SummariesPage';
import { VideoSummarizerPage } from './pages/VideoSummarizerPage';
import { ImportantPointsPage } from './pages/ImportantPointsPage';
import { QuizPage } from './pages/QuizPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { PdfChatPage } from './pages/PdfChatPage';
import { ProgressPage } from './pages/ProgressPage';
import { MaterialsLibraryPage } from './pages/MaterialsLibraryPage';
import { SettingsPage } from './pages/SettingsPage';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Protected Layout Shell
const ProtectedAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-600 animate-spin flex items-center justify-center text-white font-bold">
            S
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Smart Study AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student Dashboard Modules */}
            <Route
              path="/dashboard"
              element={
                <ProtectedAppLayout>
                  <DashboardPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedAppLayout>
                  <AssistantPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedAppLayout>
                  <UploadPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/summaries"
              element={
                <ProtectedAppLayout>
                  <SummariesPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/video-summarizer"
              element={
                <ProtectedAppLayout>
                  <VideoSummarizerPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/important-points"
              element={
                <ProtectedAppLayout>
                  <ImportantPointsPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/quiz"
              element={
                <ProtectedAppLayout>
                  <QuizPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/study-planner"
              element={
                <ProtectedAppLayout>
                  <StudyPlannerPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/pdf-chat"
              element={
                <ProtectedAppLayout>
                  <PdfChatPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedAppLayout>
                  <ProgressPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/materials"
              element={
                <ProtectedAppLayout>
                  <MaterialsLibraryPage />
                </ProtectedAppLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedAppLayout>
                  <SettingsPage />
                </ProtectedAppLayout>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
