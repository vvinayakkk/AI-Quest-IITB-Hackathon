
import React from 'react';
import { SearchBar } from '../search/SearchBar';
import { NavigationLink, navigationItems } from './NavigationItems';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileButton } from '../UserProfileButton';

export const MobileMenu = ({ isOpen, notificationCount, isSignedIn }) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden px-4 pt-2 pb-3 space-y-1">
      <SearchBar mobile className="mb-4" />
      {navigationItems.map((item, index) => (
        <NavigationLink
          key={index}
          {...item}
          className="px-4 py-2 block"
        />
      ))}
      {/* ...rest of mobile menu items */}
    </div>
  );
};