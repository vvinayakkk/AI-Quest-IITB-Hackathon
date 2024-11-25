import React from 'react';

export const SearchBar = ({ className = '', mobile = false }) => (
  <div className={`relative w-full ${className}`}>
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      placeholder="Search by keywords or tags..."
      className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-accent text-sm focus:ring-2 focus:ring-primary focus:border-transparent ${
        mobile ? 'text-text' : ''
      }`}
    />
  </div>
);