export const isConstructionMode = () => {
  return process.env.NEXT_PUBLIC_CONSTRUCTION_MODE === 'true';
};

export const CONSTRUCTION_CONFIG = {
  isEnabled: process.env.NEXT_PUBLIC_CONSTRUCTION_MODE === 'true',
  message: "",
  showEmailSignup: true,
  showSocialLinks: true,
  enableAnimations: true,
  videoAutoplay: true,
  videoPath: '/assets/main-background.mp4',
  fallbackImagePath: '/assets/images/fallback-bg.jpg',
} as const; 