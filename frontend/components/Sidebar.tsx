"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Menu, Users, X } from "lucide-react";
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
  { href: "/students", label: "Students", icon: Users, roles: ["ADMIN", "LECTURER"] },
  { href: "/courses", label: "Courses", icon: BookOpen, roles: ["ADMIN", "LECTURER", "STUDENT"] },
];

function Brand() {
  return (
    <div className="flex items-center gap-2 font-semibold text-white">
      <GraduationCap className="text-indigo-400" size={24} />
      <span>Student Management</span>
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

  const nav = (
    <nav className="space-y-1">
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-indigo-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const profile = (
    <div className="border-t border-slate-800 pt-4">
      <div className="px-2">
        <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
        <span className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${roleBadge[user.role]}`}>
          {user.role}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-slate-900 px-4 py-3 md:hidden">
        <Brand />
        <button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      {open && (
        <div className="space-y-4 bg-slate-900 px-4 pb-4 md:hidden">
          {nav}
          {profile}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-900 p-4 md:flex">
        <div className="mb-8 px-2 pt-2">
          <Brand />
        </div>
        {nav}
        <div className="mt-auto">{profile}</div>
      </aside>
    </>
  );
}