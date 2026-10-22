"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { getErrorMessage, getFieldErrors } from "@/lib/api";
import { card, fieldInputClass, primaryBtn } from "@/lib/theme";
import Field from "@/components/Field";
import { FieldErrors, confirmPassword, email, firstError, password, personName, username } from "@/lib/validation";

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
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const fullName = personName(form.fullName, "Full name");
    const userName = username(form.username);
    const mail = email(form.email);
    const pass = password(form.password);
    const confirm = confirmPassword(form.confirmPassword, form.password);
    if (fullName) next.fullName = fullName;
    if (userName) next.username = userName;
    if (mail) next.email = mail;
    if (pass) next.password = pass;
    if (confirm) next.confirmPassword = confirm;
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      messages.error(firstError(next) || "Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      messages.success("Registration submitted. An admin must approve your account before you can sign in.");
      router.push("/login");
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(fields);
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

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName}>
            <input
              className={fieldInputClass(errors.fullName)}
              placeholder="e.g. John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="Username" error={errors.username}>
            <input
              className={fieldInputClass(errors.username)}
              placeholder="e.g. jdoe"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Email address" error={errors.email}>
          <input
            className={fieldInputClass(errors.email)}
            type="email"
            placeholder="e.g. john@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Password (min 8 chars)" error={errors.password}>
            <input
              className={fieldInputClass(errors.password)}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <Field label="Confirm password" error={errors.confirmPassword}>
            <input
              className={fieldInputClass(errors.confirmPassword)}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </Field>
        </div>

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
