// sharedComponents/RoomCard.tsx

"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface RoomCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  bgColor: string; // Tailwind color class, e.g., 'bg-primary'
}

const RoomCard: React.FC<RoomCardProps> = ({ title, description, href, icon, bgColor }) => {
  return (
    <motion.div
      className={`p-6 border rounded-lg bg-card dark:bg-card dark:text-card-foreground shadow-lg transition-shadow duration-300 group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: '0px 10px 20px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <div className="text-primary dark:text-accent mr-3">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold text-foreground dark:text-card-foreground">
          {title}
        </h2>
      </div>
      <p className="text-muted-foreground dark:text-muted-foreground mb-6">
        {description}
      </p>
      <Link
        href={href}
        className={`inline-flex items-center justify-center ${bgColor} text-accent-foreground px-6 py-3 rounded transition-colors duration-300 hover:bg-accent hover:text-background group`}
      >
        Enter {title}
        {/* Inline SVG Arrow Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </motion.div>
  );
};

export default RoomCard;