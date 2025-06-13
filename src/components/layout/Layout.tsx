'use client';

import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">{children}</main>
      <footer className="border-t border-border py-6 bg-background">
        <div className="container flex justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} vMARKET. All rights reserved.</p>
          <p>Powered by Blockchain Technology</p>
        </div>
      </footer>
    </div>
  );
} 