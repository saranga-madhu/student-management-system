"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { card } from "@/lib/theme";
import Sidebar from "@/components/Sidebar";
import Spinner from "@/components/Spinner";
import { Role } from "@/types";

import { ShieldAlert } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/register"];

// Pages that only some roles may open
const ROUTE_ROLES: Record<string, Role[]> = {
  "/students": ["ADMIN", "LECTURER"],
  "/lecturers": ["ADMIN"],
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-radial-[at_top] from-slate-100/80 via-slate-50 to-slate-100/90 p-4">
        {children}
      </main>
    );
  }

  if (!ready || !user) return <Spinner label="Loading..." />;

  const requiredRoles = Object.entries(ROUTE_ROLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];
  const allowed = !requiredRoles || requiredRoles.includes(user.role);

  return (
    <>
      <Sidebar />
      <main className="min-h-screen md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          {allowed ? (
            children
          ) : (
            <div className={`${card} mx-auto mt-12 max-w-md p-8 text-center shadow-xs`}>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <ShieldAlert size={26} />
              </div>
              <h1 className="text-lg font-bold text-slate-900">Access denied</h1>
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