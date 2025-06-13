'use client';

import React, { useEffect, useState } from 'react';
import { BackgroundVideo } from './BackgroundVideo';
import { EmailSignup } from './EmailSignup';
import { SocialLinks } from './SocialLinks';
import { CONSTRUCTION_CONFIG } from '@/lib/construction-mode';

export function ConstructionLanding() {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <BackgroundVideo />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Logo/Brand Section */}
          <div className={`mb-8 transition-all duration-1000 transform ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 
              className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-tight"
              style={{
                fontFamily: "'Fredoka One', cursive",
                color: '#FF6B35',
                textShadow: '4px 4px 0px #2D3436, 8px 8px 0px rgba(45, 52, 54, 0.5)',
                transform: 'rotate(-2deg)'
              }}
            >
              v<span style={{ color: '#4ECDC4' }}>MARKET</span>
            </h1>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ background: '#FF6B35' }}></div>
          </div>

          {/* Main Message */}
          <div className={`mb-12 transition-all duration-1000 delay-300 transform ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p 
              className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
              style={{
                fontFamily: "'Fredoka', cursive",
                color: '#FFF3B0',
                textShadow: '2px 2px 0px #2D3436'
              }}
            >
              Trades like a dex. Predicts like polymarket. <br />
              <span style={{ color: '#F38BA8' }}></span>
            </p>
          </div>

          {/* Email Signup */}
          {CONSTRUCTION_CONFIG.showEmailSignup && (
            <div className={`mb-12 transition-all duration-1000 delay-500 transform ${
              isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <EmailSignup />
            </div>
          )}

          {/* Social Links */}
          {CONSTRUCTION_CONFIG.showSocialLinks && (
            <div className={`mb-8 transition-all duration-1000 delay-700 transform ${
              isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <SocialLinks />
            </div>
          )}

          {/* Footer Info */}
          <div className={`transition-all duration-1000 delay-900 transform ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p 
              style={{
                fontFamily: "'Fredoka', cursive",
                color: '#95E1D3',
                textShadow: '1px 1px 0px #2D3436'
              }}
              className="text-sm"
            >
              Powered by blockchain magic ✨ Built for pure awesome 🚀
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-8 h-12 rounded-full flex justify-center items-center"
            style={{
              border: '3px solid #FF6B35',
              background: 'rgba(255, 107, 53, 0.1)'
            }}
          >
            <div 
              className="w-2 h-4 rounded-full animate-bounce"
              style={{ background: '#4ECDC4' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Background Overlay with Cartoon Colors */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(106, 76, 147, 0.4), rgba(45, 52, 54, 0.3))'
        }}
      />
      
      {/* Chunky Scattered Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-lg animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '8px',
              height: '8px',
              background: ['#FF6B35', '#4ECDC4', '#95E1D3', '#F38BA8'][i % 4],
              boxShadow: '2px 2px 0px #2D3436',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
} 