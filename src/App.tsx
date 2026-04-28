import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import RootLayout from '@/layouts/RootLayout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const TimelinePage = lazy(() => import('@/pages/TimelinePage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const QuizCategoryPage = lazy(() => import('@/pages/QuizCategoryPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:'12px' }}>🗳️</div>
        <p style={{ color:'var(--text-muted)' }}>Loading ElectEd…</p>
      </div>
    </div>
  );
}

export default function App() {
  useTranslation();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RootLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/timeline/:stageSlug" element={<TimelinePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/quiz/:category" element={<QuizCategoryPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </RootLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
