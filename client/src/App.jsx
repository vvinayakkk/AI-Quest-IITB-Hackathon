import { useEffect } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layout/MainLayout';

import AskQuestion from '@/pages/AskQuestion';
import CategoriesPage from './pages/CategoriesPage';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationPage';
import PostDetail from './pages/PostDetail';
import ProfilePage from './pages/ProfilePage';
import SignupPage from './pages/SignupPage';
import TagsPage from '@/pages/TagsPage';
import AskGenie from '@/pages/AskGenie';

import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signup');
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="dark:bg-black flex justify-center items-center">
        <Loader2 />
      </div>
    );
  }

  return user ? <Outlet context={{ username: user.username }} /> : null;
};

const App = () => {
  return (
    <AuthProvider>
      <div>
        <Toaster position="bottom-right" richColors />
        <Routes>
          {/* Routes without Layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/qa-ask" element={<AskQuestion />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/genie" element={<AskGenie />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;