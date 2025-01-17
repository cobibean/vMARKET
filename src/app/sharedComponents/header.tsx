"use client";

import React, { useState } from "react";
import Link from "next/link";
import DarkModeToggle from "./darkModeToggle";
import { FaHome, FaBars } from "react-icons/fa";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="p-4 bg-background dark:bg-background border-b border-border shadow relative">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Branding */}
        <div className="flex items-center space-x-2">
          <img src="/favicon.ico" alt="vMARKET Logo" className="h-12 w-12" />
          <span className="text-lg font-bold text-foreground dark:text-foreground">
            vMARKET
          </span>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
            className="text-foreground dark:text-foreground focus:outline-none"
          >
            <FaBars className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <ul
          className={`${
            menuOpen ? "flex" : "hidden"
          } flex-col md:flex md:flex-row md:items-center absolute md:relative top-full left-0 right-0 bg-background md:bg-transparent z-50 p-4 md:p-0`}
        >
          <li className="flex items-center justify-center text-center">
            <Link
              href="/"
              className="flex items-center text-foreground hover:text-primary transition-colors duration-300"
            >
              <FaHome className="mr-1" />
              Home
            </Link>
          </li>
          <div className="hidden md:block h-6 w-px bg-border mx-4"></div> {/* Divider */}
          <li className="flex items-center justify-center text-center">
            <Link
              href="https://app.hercules.exchange/?token2=0x848E329d9C3FF5D3078C4670c773651155386C46"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-foreground hover:text-primary transition-colors duration-300"
            >
              Trade VESTA
            </Link>
          </li>
          <div className="hidden md:block h-6 w-px bg-border mx-4"></div> {/* Divider */}
          <li className="flex items-center justify-center text-center">
            <Link
              href="https://t.me/+cEis7ManxyJkODc0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-foreground hover:text-primary transition-colors duration-300"
            >
              Join the Community
            </Link>
          </li>
          <div className="hidden md:block h-6 w-px bg-border mx-4"></div> {/* Divider */}
          <li className="flex items-center justify-center text-center">
            <Link
              href="/earn"
              className="flex items-center text-foreground hover:text-primary transition-colors duration-300"
            >
              Earn
            </Link>
          </li>
        </ul>

        {/* Dark Mode Toggle */}
        <div className="hidden md:block">
          <DarkModeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;