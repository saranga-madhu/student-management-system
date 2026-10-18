"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { getErrorMessage } from "@/lib/api";
import { Lock, UserCircle } from "lucide-react";
import { card, inputClass, primaryBtn, roleBadge } from "@/lib/theme";
import Field from "@/components/Field";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const messages = useMessages();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setFullName(user.fullName);
        setEmail(user.email);
      });
    }
  }, [user]);

  if (!user) return null;

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password && password.length < 8) {
      messages.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      messages.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password || undefined,
      });
      setPassword("");
      setConfirmPassword("");
      messages.success("Profile updated");
    } catch (err) {
      messages.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Profile Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal account details, contact info, and security credentials.
        </p>
      </div>

      <div className={`${card} p-6 sm:p-8`}>
        {/* Profile Header */}
        <div className="flex flex-col items-start gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-xl font-bold text-white shadow-sm shadow-indigo-500/25">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900">{user.fullName}</h2>
            <p className="text-sm text-slate-500">@{user.username}</p>
            <div className="mt-2">
              <span className={roleBadge[user.role]}>{user.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <UserCircle size={15} className="text-indigo-600" />
              Personal Info
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Username">
                <input className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`} value={user.username} disabled />
              </Field>
              <Field label="Role">
                <input className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`} value={user.role} disabled />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name">
                <input
                  className={inputClass}
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
              <Field label="Email Address">
                <input
                  className={inputClass}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Lock size={15} className="text-indigo-600" />
              Security & Password
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="New Password (optional)">
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Leave blank to keep current"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field label="Confirm New Password">
                <input
                  className={inputClass}
                  type="password"
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Saving..." : "Save profile changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
