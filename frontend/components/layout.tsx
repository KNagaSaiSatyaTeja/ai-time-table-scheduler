"use client";

import { ProtectedRoute } from "./protected-route";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
