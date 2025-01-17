// app/layout.tsx

"use client";

import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/app/ui/toaster";
import { ThemeProvider } from "@/app/context/themeContext"; // Adjust the path if necessary
import Header from "@/app/sharedComponents/header"; // Import the Header component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ThirdwebProvider>
            {/* Header Component */}
            <Header /> {/* Added Header here */}

            {/* Main Content */}
            <main className="container mx-auto p-4">{children}</main>
          </ThirdwebProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}