"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserRole } from "@/types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (!loading && user && !allowedRoles.includes(user.role)) {
      // If not allowed, redirect to dashboard root or POS if employee
      if (user.role === "employee") {
        router.push("/dashboard/pos");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          Vérification des accès...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
