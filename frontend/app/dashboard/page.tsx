"use client";

import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { UserDashboard } from "@/components/user-dashboard";
import { ProtectedRoute } from "@/components/protected-route";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      {user?.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </ProtectedRoute>
  );
}
