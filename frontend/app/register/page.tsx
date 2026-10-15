"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { getErrorMessage } from "@/lib/api";
import { card, inputClass, primaryBtn } from "@/lib/theme";
import Field from "@/components/Field";
import { Role } from "@/types";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "STUDENT", label: "Student", hint: "View your attendance, marks and timetable" },
  { value: "LECTURER", label: "Lecturer", hint: "Manage students, attendance and marks" },
  { value: "ADMIN", label: "Admin", hint: "Full access to the system" },
];

const emptyForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "STUDENT" as Role,
  staffCode: "",
};

export default function RegisterPage() {
  const { user, ready, register } = useAuth();
  const messages = useMessages();
  const router = useRouter();

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const needsCode = form.role !== "STUDENT";

  function validate(): string | null {
    if (form.username.trim().length < 3) return "Username must be at least 3 characters";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (needsCode && !form.staffCode.trim()) return "Staff access code is required for this role";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        staffCode: needsCode ? form.staffCode : undefined,
      });
      messages.success("Account created. You can now sign in.");
      router.push("/login");
    } catch (err) {
      messages.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${card} w-full max-w-lg p-8`}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <UserPlus size={26} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">Choose your role and fill in your details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-xs font-medium text-slate-600">I am a</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ROLES.map((r) => {
              const selected = form.role === r.value;
              return (
                <label
                  key={r.value}
                  className={`cursor-pointer rounded-lg border p-3 transition ${
                    selected
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={selected}
                    onChange={() => setForm({ ...form, role: r.value })}
                    className="sr-only"
                  />
                  <span className="block text-sm font-semibold text-slate-900">{r.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{r.hint}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputClass} required value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Username">
            <input className={inputClass} required autoComplete="username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Field>
        </div>

        <Field label="Email">
          <input className={inputClass} type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Password (min 8 characters)">
            <input className={inputClass} type="password" required autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Confirm password">
            <input className={inputClass} type="password" required autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </Field>
        </div>

        {needsCode && (
          <Field label="Staff access code">
            <input className={inputClass} type="password" value={form.staffCode}
              placeholder="Provided by the administrator"
              onChange={(e) => setForm({ ...form, staffCode: e.target.value })} />
          </Field>
        )}

        {formError && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {formError}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full`}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}