import { useEffect } from 'react';
import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';

// Third-party libraries
import { useUser } from '@clerk/clerk-react';
import { Toaster } from 'sonner';

// Components & Layout
import MainLayout from './layout/MainLayout';

// Pages
import AskQuestion from '@/pages/AskQuestion';
import CategoriesPage from './pages/CategoriesPage';
import Home from './pages/Home';
import LandingPage from '@/pages/LandingPage';
import LandingPage3 from './pages/LandingPage3';
import Login from './pages/Login';
import NotificationsPage from './pages/NotificationPage';
import PostDetail from './pages/PostDetail';
import ProfilePage from './pages/ProfilePage';
import Register from './pages/Register';
import TagsPage from '@/pages/TagsPage';

// Icons
import { Loader2 } from 'lucide-react';

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
            <Route path="/post/:id" element={<PostDetail />} /> {/* Add :id parameter */}
            <Route path="/qa-ask" element={<AskQuestion />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/notif" element={<NotificationsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
};

export default App;