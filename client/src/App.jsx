// import React from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from '@/pages/LandingPage';
import QAPlatform from '@/pages/QAPlatform';
import { QuestionDetail, AskQuestion, UserProfile, TagsPage } from '@/pages/QADetail';
import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/clerk-react';
import Register from './pages/Register';
import Login from './pages/Login';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import LandingPage3 from './pages/LandingPage3';
import PostDetail from './pages/PostDetail';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationPage';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const username = user?.username || "Buddy";
  console.log(user?.username);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/signup');
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="dark:bg-black flex justify-center items-center">
        <Loader2 />
      </div>
    );
  }

  // // Pass `username` as a prop if rendering `Dashboard`
  return isSignedIn ? (
    <Outlet context={{ username }} />
  ) : null;
};

const App = () => {
  return (
    <div>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Routes without Layout */}
        <Route path="/" element={<LandingPage3 />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Routes with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/post" element={<PostDetail />} />
            <Route path="/qa" element={<QAPlatform />} />
            <Route path="/qa-detail" element={<QuestionDetail />} />
            <Route path="/qa-ask" element={<AskQuestion />} />
            <Route path="/user" element={<UserProfile />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/notif" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};


export default App;