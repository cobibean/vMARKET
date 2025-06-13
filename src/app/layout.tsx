// app/layout.tsx

import "./globals.css";
import { Layout } from "@/components/layout/Layout";
import { ConstructionLayout } from "@/components/layout/ConstructionLayout";
import { isConstructionMode } from "@/lib/construction-mode";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "vMARKET - Prediction Markets Platform",
  description: "A decentralized prediction markets platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use construction layout when in construction mode
  const LayoutComponent = isConstructionMode() ? ConstructionLayout : Layout;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <LayoutComponent>{children}</LayoutComponent>
      </body>
    </html>
  );
}