import { Role } from "@/types";

export const card = "rounded-xl border border-slate-200 bg-white shadow-sm";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export const labelClass = "mb-1 block text-xs font-medium text-slate-600";

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

export const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

export const roleBadge: Record<Role, string> = {
  ADMIN: "bg-rose-100 text-rose-700",
  LECTURER: "bg-amber-100 text-amber-700",
  STUDENT: "bg-emerald-100 text-emerald-700",
};