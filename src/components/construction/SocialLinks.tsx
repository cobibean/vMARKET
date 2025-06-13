'use client';

import React from 'react';
import { FaTwitter, FaTelegram } from 'react-icons/fa';

interface SocialLinksProps {
  className?: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const socialLinks: SocialLink[] = [
  {
    name: 'Twitter',
    url: 'https://x.com/vMARKET___', // TODO: Add actual Twitter URL
    icon: <FaTwitter className="w-6 h-6" />,
    color: '#4ECDC4',
  },
  {
    name: 'Telegram',
    url: '#', // TODO: Add actual Telegram URL
    icon: <FaTelegram className="w-6 h-6" />,
    color: '#95E1D3',
  },
];

export function SocialLinks({ className = '' }: SocialLinksProps) {
  return (
    <div className={`flex justify-center gap-6 ${className}`}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 p-3 rounded-lg"
          style={{
            color: link.color,
            background: '#2D3436',
            border: '2px solid #2D3436',
            boxShadow: '3px 3px 0px rgba(45, 52, 54, 0.8)',
            transform: 'rotate(-2deg)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'rotate(2deg) scale(1.1) translateY(-4px)';
            e.currentTarget.style.boxShadow = '5px 5px 0px rgba(45, 52, 54, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'rotate(-2deg) scale(1) translateY(0px)';
            e.currentTarget.style.boxShadow = '3px 3px 0px rgba(45, 52, 54, 0.8)';
          }}
          aria-label={`Follow us on ${link.name}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
} 