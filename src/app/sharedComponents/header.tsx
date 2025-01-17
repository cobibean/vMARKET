// sharedComponents/header.tsx

"use client";

import React from 'react';
import Link from 'next/link';
import DarkModeToggle from './darkModeToggle';
import { FaHome, FaInfoCircle, FaEnvelope } from 'react-icons/fa'; // Example navigation icons

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-background dark:bg-background border-b border-border shadow">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Branding */}
        <div className="flex items-center space-x-2">
          <img src="/favicon.ico" alt="vMARKET Logo" className="h-12 w-12" />
          <span className="text-lg font-bold text-foreground dark:text-foreground">
            vMARKET
          </span>
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="flex items-center text-foreground hover:text-primary transition-colors duration-300">
              <FaHome className="mr-1" />
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="flex items-center text-foreground hover:text-primary transition-colors duration-300">
              <FaInfoCircle className="mr-1" />
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" className="flex items-center text-foreground hover:text-primary transition-colors duration-300">
              <FaEnvelope className="mr-1" />
              Contact
            </Link>
          </li>
        </ul>

        {/* Dark Mode Toggle */}
        <DarkModeToggle />
      </nav>
    </header>
  );
};

export default Header;