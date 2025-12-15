"use client";

import {Inter, Space_Grotesk} from "next/font/google";
import {useState, useEffect} from "react";
import {Navbar} from "@/components/layout/navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
});

export default function RootLayout({children}: {children: React.ReactNode}) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    setTheme(savedTheme || systemTheme);
  }, []);

  useEffect(() => {
    // Update document class and local storage when theme changes
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <html lang='en' className={theme}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <div className='flex min-h-screen flex-col'>
          <Navbar theme={theme} onThemeToggle={handleThemeToggle} />
          <div className='flex-1'>{children}</div>
        </div>
      </body>
    </html>
  );
}
