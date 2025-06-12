"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider"; // Updated import path
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if ( !user) {
      router.push(fallbackPath);
      return;
    }

    // If role is required and user doesn't have it, redirect to unauthorized
    if (requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
  }, [isLoading, user, requiredRole, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if ( !user) {
    return null;
  }

  // Don't render children if role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

// Additional component for role-based access control
export function RoleBasedRoute({
  children,
  allowedRoles,
  fallbackPath = "/unauthorized",
}: {
  children: React.ReactNode;
  allowedRoles: Array<"admin" | "user">;
  fallbackPath?: string;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Fixed the invalid if condition
    if (!user) {
      router.push("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
  }, [isLoading, user, requiredRole, router, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if ( !user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

// HOC for protecting pages
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredRole?: "admin" | "user"
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}
