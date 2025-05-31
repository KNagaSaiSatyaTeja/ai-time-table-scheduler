"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/hooks/use-auth";
import { GraduationCap } from "lucide-react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "student" | "Teacher";
  token: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      // Correctly access the user data from response
      const { user, token } = response.data;

      console.log("Login response:", response.data);
      console.log("User data:", user);

      // Make sure all required fields are present
      if (
        !user ||
        !user.id ||
        !user.email ||
        !user.username ||
        !user.role ||
        !token
      ) {
        throw new Error("Invalid response format from server");
      }

      // Save user to context with correct data structure
      login({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        token: token,
      });

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      console.log("Login failed:", error.message);
      // You might want to add some user feedback here, like a toast notification
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">AI Scheduling System</CardTitle>
          <CardDescription>
            Sign in to access the automated scheduling platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
