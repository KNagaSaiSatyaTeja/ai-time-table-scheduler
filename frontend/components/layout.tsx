"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>
      </div>
    </ThemeProvider>
  );
}
