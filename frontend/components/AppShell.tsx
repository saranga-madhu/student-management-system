"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { card } from "@/lib/theme";
import Sidebar from "@/components/Sidebar";
import Spinner from "@/components/Spinner";
import { Role } from "@/types";

const PUBLIC_PATHS = ["/login", "/register"];

// Pages that only some roles may open
const ROUTE_ROLES: Record<string, Role[]> = {
  "/students": ["ADMIN", "LECTURER"],
};

export default function AppShell({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (ready && !user && !isPublic) router.replace("/login");
  }, [ready, user, isPublic, router]);

  if (isPublic) {
    return <main className="flex min-h-screen items-center justify-center p-4">{children}</main>;
  }

  if (!ready || !user) return <Spinner label="Loading..." />;

  const requiredRoles = Object.entries(ROUTE_ROLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];
  const allowed = !requiredRoles || requiredRoles.includes(user.role);

  return (
    <>
      <Sidebar />
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-8">
          {allowed ? (
            children
          ) : (
            <div className={`${card} mx-auto mt-10 max-w-md p-8 text-center`}>
              <h1 className="text-lg font-semibold text-slate-900">Access denied</h1>
              <p className="mt-2 text-sm text-slate-500">
                Your role ({user.role}) does not have permission to open this page.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}