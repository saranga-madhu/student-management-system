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

const emptyForm = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
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

  function validate(): string | null {
    if (form.username.trim().length < 3) return "Username must be at least 3 characters";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
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
      });
      messages.success("Student account created. You can now sign in.");
      router.push("/login");
    } catch (err) {
      messages.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${card} w-full max-w-lg p-8 shadow-xl shadow-slate-200/50 border-slate-200/90`}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25">
          <UserPlus size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Registration</h1>
        <p className="mt-1 text-sm text-slate-500">Create an account to enroll in courses and track degrees</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              className={inputClass}
              placeholder="e.g. John Doe"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="Username">
            <input
              className={inputClass}
              placeholder="e.g. jdoe"
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Email address">
          <input
            className={inputClass}
            type="email"
            placeholder="e.g. john@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Password (min 8 chars)">
            <input
              className={inputClass}
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Field label="Confirm password">
            <input
              className={inputClass}
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </Field>
        </div>

        {formError && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {formError}
          </p>
        )}

        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-2.5`}>
          {submitting ? "Creating account..." : "Complete registration"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
