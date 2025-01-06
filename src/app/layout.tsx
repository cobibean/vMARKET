"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [input, setInput] = useState("");

  const correctPassword = "Tester69420!"; // Replace with your desired password

  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "sans-serif",
          }}
        >
          <h1 style={{ marginBottom: "16px" }}>Enter Password</h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter the password"
            style={{
              padding: "8px",
              fontSize: "16px",
              marginBottom: "8px",
            }}
          />
          <button
            onClick={() => {
              if (input === correctPassword) {
                setIsAuthenticated(true);
              } else {
                alert("Incorrect password. Please try again.");
              }
            }}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
        <Toaster />
      </body>
    </html>
  );
}