"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, UserCircle, UserCog, Users, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { roleBadge } from "@/lib/theme";
import { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "LECTURER", "STUDENT"] },
  { href: "/lecturers", label: "Lecturers", icon: UserCog, roles: ["ADMIN"] },
  { href: "/students", label: "Students", icon: Users, roles: ["ADMIN", "LECTURER"] },
  { href: "/courses", label: "Courses", icon: BookOpen, roles: ["ADMIN", "LECTURER", "STUDENT"] },
  { href: "/profile", label: "Profile", icon: UserCircle, roles: ["ADMIN", "LECTURER", "STUDENT"] },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-sm shadow-indigo-500/25">
        <GraduationCap size={22} />
      </div>
      <div>
        <span className="block text-sm font-bold tracking-tight text-white">EduManager</span>
        <span className="block text-2xs font-medium text-slate-400">Student System</span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const links = NAV.filter((item) => item.roles.includes(user.role));

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const nav = (
    <nav className="space-y-1.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-indigo-600 text-white shadow-xs font-semibold"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
            }`}
          >
            <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const profile = (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 font-semibold text-white shadow-2xs">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
          <div className="mt-0.5">
            <span className={roleBadge[user.role]}>
              {user.role}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/80 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-[0.98]"
      >
        <LogOut size={14} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden">
        <Brand />
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      {open && (
        <div className="space-y-4 border-b border-slate-800 bg-slate-900 px-4 pb-4 md:hidden">
          {nav}
          {profile}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-800/80 bg-slate-900 p-4 md:flex">
        <div className="mb-8 px-2 pt-2">
          <Brand />
        </div>
        {nav}
        <div className="mt-auto">{profile}</div>
      </aside>
    </>
  );
}