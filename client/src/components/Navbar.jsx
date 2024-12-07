import React, { useState } from 'react';
import { UserProfileButton } from './UserProfileButton';
import { useAuth } from '../contexts/AuthContext';  // Updated import
import { Button } from './ui/button';
import { SearchBar } from './search/SearchBar';
import { NavigationLink, navigationItems } from './navigation/NavigationItems';
import { MobileMenu } from './navigation/MobileMenu';
import { NotificationDropdown } from './navigation/NotificationDropdown';
import { VideoModal } from './modals/VideoModal';
import { Logo } from './navigation/Logo';
import AskQuestion from '@/pages/AskQuestion';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const { user, logout } = useAuth();
  const [notificationCount] = useState(4);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 border-b border-accent shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Logo />
            <button 
              onClick={() => setShowVideo(true)}
              className="p-2 rounded-full hover:bg-accent/10 transition"
            >
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchBar />
          </div>

          {/* Desktop Menu Items */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item, index) => (
              <NavigationLink key={index} {...item} />
            ))}
            <NotificationDropdown count={notificationCount} />
            {user ? (
              <div className="flex items-center space-x-4">
                <UserProfileButton user={user} onLogout={handleLogout} />
              </div>
            ) : (
              <a href="/login" className="text-sm font-medium text-primary hover:text-accent transition">
                Sign In
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          notificationCount={notificationCount}
          isSignedIn={!!user}
          onLogout={handleLogout}
        />
      </nav>

      <VideoModal isOpen={showVideo} onClose={() => setShowVideo(false)} />
      {isOpen && <AskQuestion isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  );
};

export default Navbar;