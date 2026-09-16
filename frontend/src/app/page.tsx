"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth-store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
          <span className="text-3xl">💰</span>
        </div>
        <h1 className="text-2xl font-[family-name:var(--font-outfit)] font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          FinAI
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
          Loading your financial dashboard...
        </p>
      </div>
    </div>
  );
}
