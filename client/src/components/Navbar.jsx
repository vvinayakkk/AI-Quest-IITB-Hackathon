import React, { useState } from 'react';
import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from './ui/button';
import { is } from 'date-fns/locale';
import { AskQuestion } from '@/pages/QADetail';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const { isSignedIn } = useUser();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-background/95 border-b border-accent shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="/circle.png"
            className="h-8"
            alt="QA Logo"
          />
          <span className="text-text text-2xl font-semibold">
            Q&A Hub
          </span>
        </a>

        {/* <div className="hidden md:flex items-center relative w-1/3">
                    <svg
                        className="absolute left-3 w-5 h-5 text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                        />
                    </svg>
                    <input
                        type="text"
                        className="w-full bg-background text-text rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary placeholder-primary"
                        placeholder="Search for questions..."
                    />
                </div> */}

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Button onClick={() => setIsOpen(true)} className="bg-accent hover:bg-secondary text-white">
            Ask a Question
          </Button>
          <a
            href="/categories"
            className="text-sm font-medium text-primary hover:text-accent transition"
          >
            Categories
          </a>
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <a
              href="/sign-in"
              className="text-sm font-medium text-primary hover:text-accent transition"
            >
              Sign In
            </a>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          className="md:hidden text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-lg"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 pt-2 pb-3 space-y-1">
          <div className="relative mb-4">
            <svg
              className="absolute left-3 top-3 w-5 h-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="text"
              className="w-full bg-background text-text rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary placeholder-primary"
              placeholder="Search for questions..."
            />
          </div>
          <a
            href="/qa-ask"
            className="block px-4 py-2 text-sm font-medium text-background bg-primary rounded-lg hover:bg-accent transition"
          >
            Ask a Question
          </a>
          <a
            href="/categories"
            className="block px-4 py-2 text-sm font-medium text-primary hover:text-accent transition"
          >
            Categories
          </a>
          {isSignedIn ? (
            <div className="px-4 py-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <a
              href="/sign-in"
              className="block px-4 py-2 text-sm font-medium text-primary hover:text-accent transition"
            >
              Sign In
            </a>
          )}
        </div>
      </div>

    </nav>
      {isOpen && (
        <AskQuestion isOpen={isOpen} setIsOpen={setIsOpen} />
      )}
      </>
  );
};

export default Navbar;
