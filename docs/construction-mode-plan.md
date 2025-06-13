# vMARKET Construction Mode Implementation Plan

## Overview
This document outlines the complete implementation plan for putting vMARKET into "construction mode" - replacing the current full-featured homepage with a sleek "brb... cooking up v2..." landing page while we build the new version.

## Project Structure & Current State
- **Framework**: Next.js 15 with App Router
- **Current Homepage**: `src/app/page.tsx` (full vMARKET homepage)
- **Main Layout**: `src/app/layout.tsx` wraps all pages
- **Assets Directory**: `public/` (currently has basic SVGs)

## Implementation Strategy: Option A - Root Page Modification
We'll modify the root page (`src/app/page.tsx`) to conditionally show either:
- **Construction Mode**: New landing page with background video/image
- **Normal Mode**: Original vMARKET homepage (when ready to launch v2)

---

## Phase 1: Media Assets Preparation

### Directory Structure Setup
```bash
mkdir -p public/assets/images
mkdir -p public/assets/videos
mkdir -p public/assets/audio  # optional for ambient sounds
```

### Required Media Files

#### Primary Background Video ✅ ADDED
- **File**: `public/assets/veo30generatepreview_A_loopable_5second_animated_clip_of_a_chi_0 (3).mp4`
- **Specifications**: 
  - Duration: 5 seconds (perfect for seamless looping)
  - Format: MP4 (AI-generated, loopable animation)
  - Optimized for web delivery
  - Features animated character/chi element
  - Ready for implementation

#### Fallback Background Image
- **File**: `public/assets/images/fallback-bg.jpg`
- **Purpose**: Fallback for slow connections or video load failures
- **Specifications**:
  - Resolution: 1920x1080 minimum
  - Format: JPG (optimized) or WebP
  - File size: Under 2MB

#### ✅ SELECTED STRATEGY: Option 2 - Single Hero Video
**Chosen Approach:**
- **Single loopable background video** (5 seconds, seamless loop)
- **Character-based animation** (chi/Vic character element)
- **Minimal complexity** for fast loading and smooth performance
- **Interactive potential** (can add hover effects or click interactions later)
- **Perfect loop duration** allows for smooth, mesmerizing background effect

### ✅ MEDIA ASSETS READY
**Video Asset Status:**
- ✅ **Primary background video imported**: `public/assets/veo30generatepreview_A_loopable_5second_animated_clip_of_a_chi_0 (3).mp4`
- ✅ **Perfect 5-second loop duration** for seamless background playback
- ✅ **AI-generated, optimized** for web performance
- ✅ **Character animation** adds personality to the construction page

**Still Needed:**
- **Fallback image**: Extract a frame from the video or create a static version
- **Optional**: Create WebM version for better compression on supported browsers

**Implementation Notes:**
- The video filename has spaces and special characters - consider renaming to `main-background.mp4` for cleaner code
- Video appears to be web-optimized already (AI-generated content typically is)

---

## Phase 2: Configuration Setup

### Environment-Based Toggle
Create or update `.env.local`:
```env
# Construction Mode Toggle
NEXT_PUBLIC_CONSTRUCTION_MODE=true

# Optional: Construction mode message
NEXT_PUBLIC_CONSTRUCTION_MESSAGE="brb... cooking up v2..."
```

### Alternative: Config File Approach
```typescript
// src/lib/construction-config.ts
export const CONSTRUCTION_CONFIG = {
  isEnabled: true,
  message: "brb... cooking up v2...",
  showEmailSignup: true,
  showSocialLinks: true,
  enableAnimations: true,
  videoAutoplay: true,
} as const;
```

---

## Phase 3: Component Architecture

### New Components to Create

#### 1. Main Construction Landing Component
```
src/components/construction/ConstructionLanding.tsx
```
- Full-screen layout
- Background video/image management
- Main message display
- Optional email signup
- Social media links
- Subtle animations

#### 2. Background Video Component
```
src/components/construction/BackgroundVideo.tsx
```
- Handles video loading and fallbacks
- Responsive video sizing
- Loop functionality
- Loading states

#### 3. Email Signup Component (Optional Enhancement)
```
src/components/construction/EmailSignup.tsx
```
- Clean, minimal email collection form
- Newsletter signup for v2 launch notifications
- Form validation and submission

#### 4. Social Links Component (Optional Enhancement)
```
src/components/construction/SocialLinks.tsx
```
- Links to Twitter, Discord, etc.
- Animated hover effects
- Consistent with brand

### Layout Modifications

#### New Construction Layout
```
src/components/layout/ConstructionLayout.tsx
```
- Minimal layout without header/footer
- Full-screen capability
- Clean, distraction-free design

---

## Phase 4: Implementation Steps

### Step 1: Create Construction Mode Toggle
```typescript
// src/lib/construction-mode.ts
export const isConstructionMode = () => {
  return process.env.NEXT_PUBLIC_CONSTRUCTION_MODE === 'true';
};
```

### Step 2: Update Root Page
```typescript
// src/app/page.tsx
import { isConstructionMode } from '@/lib/construction-mode';
import { ConstructionLanding } from '@/components/construction/ConstructionLanding';
import { OriginalHomepage } from '@/components/homepage/OriginalHomepage';

export default function Home() {
  if (isConstructionMode()) {
    return <ConstructionLanding />;
  }
  
  return <OriginalHomepage />;
}
```

### Step 3: Update Layout for Construction Mode
```typescript
// src/app/layout.tsx
// Conditionally use ConstructionLayout vs normal Layout
```

### Step 4: Implement Route Protection
Ensure other routes (`/open`, `/closed`, `/admin`) also respect construction mode:
```typescript
// Add to each route page
if (isConstructionMode()) {
  return <ConstructionLanding />;
}
```

---

## Phase 5: Enhanced Features Implementation

### Animation Enhancements
- **Fade-in effects** for text and elements
- **Breathing animation** for main message
- **Particle effects** or subtle background animations
- **Smooth transitions** between states

### Email Collection Integration
- **Form handling** with validation
- **Storage solution** (Supabase, Airtable, or simple API)
- **Success/error states**
- **Privacy compliance** considerations

### Interactive Elements
- **Hover effects** on clickable elements
- **Video interaction** (pause/play on hover)
- **Progressive enhancement** for different device capabilities

---

## Phase 6: Testing & Optimization

### Performance Considerations
- **Video optimization** for different connection speeds
- **Progressive loading** strategies
- **Mobile responsiveness**
- **Accessibility** compliance

### Browser Compatibility
- **Video format support** across browsers
- **Fallback strategies** for older browsers
- **Touch device** optimizations

---

## Deployment Strategy

### Development Phase
1. **Local testing** with construction mode enabled
2. **Asset optimization** and compression
3. **Cross-browser testing**
4. **Mobile device testing**

### Production Deployment
1. **Environment variable** configuration
2. **Asset CDN** setup (optional)
3. **Monitoring** and analytics setup
4. **Rollback plan** (quick toggle back to normal mode)

---

## Next Steps for Developer

### Immediate Actions Required

1. ✅ **UPDATED - Design Decisions Made**:
   - **Video Strategy**: Single Hero Video (Option 2) - Using the 5-second loopable animated clip
   - **Video File**: `public/assets/veo30generatepreview_A_loopable_5second_animated_clip_of_a_chi_0 (3).mp4`
   - **Color Scheme**: Will align with current vMARKET branding (dark theme with primary accents)
   - **Animation Preferences**: Subtle fade-ins, breathing text animation, smooth video loop
   - **Email Signup**: YES - Include email collection for v2 launch notifications
   - **Layout**: Complete new page experience (no header/footer during construction mode)

2. **Create `page-build-plan.md`** once you decide on:
   - Specific layout structure
   - Component breakdown
   - Art direction and visual style
   - Technical implementation details
   - Timeline for completion

3. **Gather or create media assets**:
   - Source/create background video content
   - Prepare fallback images
   - Optimize all media for web

4. **Set up development environment**:
   - Create `.env.local` with construction mode enabled
   - Set up media directories
   - Plan component structure

### ✅ DESIGN DECISIONS FINALIZED

1. **Video Content**: ✅ Character-based 5-second looping animation (chi/Vic character)

2. **User Interaction**: ✅ Basic loop with potential for hover effects (keep simple initially)

3. **Brand Consistency**: ✅ Align with current vMARKET dark theme and primary colors

4. **Launch Notification**: ✅ YES - Include email collection for v2 launch notifications

5. **Social Presence**: ✅ Include relevant social media links (Twitter, Discord, etc.)

6. **Mobile Experience**: ✅ Fully responsive, optimized video playback for mobile devices

7. **Construction Message**: ✅ "brb... cooking up v2..." (confirmed)

8. **Countdown Timer**: ✅ NO - Keep it simple without countdown

---

## File Structure Summary

After implementation, your project structure will include:

```
src/
├── app/
│   ├── page.tsx (modified)
│   └── layout.tsx (modified)
├── components/
│   ├── construction/
│   │   ├── ConstructionLanding.tsx
│   │   ├── BackgroundVideo.tsx
│   │   ├── EmailSignup.tsx
│   │   └── SocialLinks.tsx
│   └── layout/
│       └── ConstructionLayout.tsx
├── lib/
│   ├── construction-mode.ts
│   └── construction-config.ts
└── docs/
    ├── construction-mode-plan.md (this file)
    └── page-build-plan.md (to be created)

public/
└── assets/
    ├── veo30generatepreview_A_loopable_5second_animated_clip_of_a_chi_0 (3).mp4 ✅ ADDED
    └── images/ (to be created)
        └── fallback-bg.jpg (to be extracted from video)
```

---

## Success Criteria

- ✅ **Easy Toggle**: Can switch between construction and normal mode instantly
- ✅ **Fast Loading**: Page loads quickly with optimized media
- ✅ **Mobile Responsive**: Works perfectly on all device sizes
- ✅ **Professional Appearance**: Clean, polished, on-brand design
- ✅ **User Engagement**: Optional email signup and social links work
- ✅ **Performance**: No negative impact on site speed or SEO 