import { Role } from "@/types";

export const card = "rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all";

export const inputClass =
  "w-full rounded-xl border border-slate-300/80 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all";

export function fieldInputClass(error?: string) {
  return error
    ? `${inputClass} border-rose-400 focus:border-rose-500 focus:ring-rose-500/10`
    : inputClass;
}

export const labelClass = "mb-1.5 block text-xs font-semibold text-slate-600";

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]";

export const dangerBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-2.5 py-1 text-xs font-medium text-rose-700 transition-all hover:bg-rose-100 active:scale-[0.98]";

export const editBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100 active:scale-[0.98]";

export const tableHeader =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/80 border-b border-slate-200";

export const tableCell = "px-4 py-3.5 text-sm text-slate-700 border-b border-slate-100";

export const toastStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm",
  error: "border-rose-200 bg-rose-50 text-rose-800 shadow-sm",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800 shadow-sm",
};

export const statusBadge: Record<"PENDING" | "APPROVED" | "REJECTED", string> = {
  PENDING: "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700",
  APPROVED: "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700",
  REJECTED: "inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700",
};

export const roleBadge: Record<Role, string> = {
  ADMIN: "inline-flex items-center rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700",
  LECTURER: "inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700",
  STUDENT: "inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700",
};