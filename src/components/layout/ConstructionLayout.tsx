import React from 'react';

interface ConstructionLayoutProps {
  children: React.ReactNode;
}

export function ConstructionLayout({ children }: ConstructionLayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
} 