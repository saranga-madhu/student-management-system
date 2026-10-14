"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO (Day 4): call POST /api/auth/login and store the JWT token
    setNotice("Login is not connected to the backend yet. Authentication (JWT) will be added.");
  }

  const input = "w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">Username</label>
          <input id="username" className={input} required
            value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input id="password" type="password" className={input} required
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Sign in
        </button>
        {notice && (
          <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {notice}
          </p>
        )}
      </form>
    </div>
  );
}