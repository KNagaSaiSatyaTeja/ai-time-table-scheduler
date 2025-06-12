"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider"; // ✅ useAuth from AuthProvider
import { AdminDashboard } from "@/components/admin-dashboard";
import { UserDashboard } from "@/components/user-dashboard";
import { ProtectedRoute } from "@/components/protected-route";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth(); // ✅ correct hook usage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("User in DashboardPage:", parsedUser);
      } catch (err) {
        console.warn("Failed to parse stored user:", err);
      }
    }
  }, []);

  // Show loader while user is being validated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Debug log from localStorage if needed (not strictly necessary)

  return (
    <ProtectedRoute>
      {user?.role === "admin" ? (
       
          <AdminDashboard />
        
      ) : (
        <UserDashboard />
      )}
    </ProtectedRoute>
  );
}
