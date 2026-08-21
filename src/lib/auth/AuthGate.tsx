"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

const PUBLIC_PATHS = new Set(["/login"]);

/** Redirects signed-out visitors to /login, and signed-in visitors away from it. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicPath) router.replace("/login");
    if (user && isPublicPath) router.replace("/");
  }, [loading, user, isPublicPath, router]);

  if (isPublicPath) return <>{children}</>;
  if (loading || !user) return null;

  return <>{children}</>;
}
