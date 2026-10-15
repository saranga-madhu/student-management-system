"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { getErrorMessage } from "@/lib/api";
import { card, inputClass, primaryBtn } from "@/lib/theme";
import Field from "@/components/Field";

export default function LoginPage() {
  const { user, ready, login } = useAuth();
  const messages = useMessages();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const loggedIn = await login(username.trim(), password);
      messages.success(`Welcome back, ${loggedIn.fullName}`);
      router.replace("/dashboard");
    } catch (err) {
      messages.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${card} w-full max-w-sm p-8`}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <GraduationCap size={26} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Username">
          <input className={inputClass} required autoComplete="username" value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </Field>
        <Field label="Password">
          <input className={inputClass} type="password" required autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button type="submit" disabled={submitting} className={`${primaryBtn} w-full`}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}