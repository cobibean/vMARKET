'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CONSTRUCTION_CONFIG } from '@/lib/construction-mode';

interface BackgroundVideoProps {
  className?: string;
}

export function BackgroundVideo({ className = '' }: BackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoKey, setVideoKey] = useState(Date.now()); // Force remount

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset states on mount
    setIsLoaded(false);
    setHasError(false);
    setIsPaused(false);

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoaded(true);
      if (CONSTRUCTION_CONFIG.videoAutoplay) {
        // Small delay to ensure video is ready
        setTimeout(() => {
          video.play().catch((error) => {
            console.log('Video autoplay failed (this is normal in some browsers):', error);
            setIsPaused(true);
          });
        }, 100);
      }
    };

    const handleLoadedData = () => {
      console.log('Video loaded data');
      setIsLoaded(true);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setHasError(true);
    };

    const handlePause = () => {
      setIsPaused(true);
    };

    const handlePlay = () => {
      setIsPaused(false);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
    };

    // Force reload the video source
    video.load();

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('pause', handlePause);
    video.addEventListener('play', handlePlay);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  if (hasError) {
    return (
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black ${className}`}
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
        }}
      />
    );
  }

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(console.log);
    } else {
      video.pause();
    }
  };

  // Force refresh video if it's been loading too long
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded && !hasError) {
        console.log('Video taking too long to load, refreshing...');
        setVideoKey(Date.now());
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoaded, hasError]);

      return (
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <video
          key={videoKey}
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 cursor-pointer ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay={CONSTRUCTION_CONFIG.videoAutoplay}
          loop
          muted
          playsInline
          preload="auto"
          onClick={handleVideoClick}
        >
          <source src={CONSTRUCTION_CONFIG.videoPath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Play indicator for paused video */}
      {isLoaded && isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4">
            <div className="text-white/80 text-2xl">▶</div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
          <div className="animate-pulse text-white/60">Loading video...</div>
        </div>
      )}
    </div>
  );
} 