"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { getErrorMessage, getFieldErrors } from "@/lib/api";
import { card, fieldInputClass, primaryBtn } from "@/lib/theme";
import Field from "@/components/Field";
import { FieldErrors, firstError, required } from "@/lib/validation";

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const messages = useMessages();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const userErr = required(username, "Username");
    const passErr = required(password, "Password");
    if (userErr) next.username = userErr;
    if (passErr) next.password = passErr;
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      messages.error(firstError(next) || "Please fill in your credentials");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const loggedIn = await login(username.trim(), password);
      messages.success(`Welcome back, ${loggedIn.fullName}`);
      router.replace("/dashboard");
    } catch (err) {
      setErrors(getFieldErrors(err));
      messages.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${card} w-full max-w-sm p-8 shadow-xl shadow-slate-200/50 border-slate-200/90`}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25">
          <GraduationCap size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your EduManager portal</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Field label="Username" error={errors.username}>
          <input
            className={fieldInputClass(errors.username)}
            autoComplete="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            className={fieldInputClass(errors.password)}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full py-2.5`}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
          Register as student
        </Link>
      </p>
    </div>
  );
}
