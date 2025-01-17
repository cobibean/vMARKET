"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/app/ui/toaster";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThirdwebProvider>
          <header className="p-4 bg-gray-100 border-b">
            <nav className="container mx-auto flex justify-between items-center">
              <div className="text-lg font-bold">vMARKET</div>
              <ul className="flex space-x-4">
                
              </ul>
            </nav>
          </header>
          <main className="container mx-auto p-4">{children}</main>
        </ThirdwebProvider>
        <Toaster />
      </body>
    </html>
  );
}