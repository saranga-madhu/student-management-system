"use client";

import { FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { Student } from "@/types";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadStudents() {
    try {
      setError("");
      const res = await api.get<Student[]>("/students");
      setStudents(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/students", {
        ...form,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
      });
      setForm(emptyForm);
      await loadStudents();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const input = "w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-4 shadow-sm space-y-3">
        <h2 className="font-semibold">Add student</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input className={input} placeholder="First name" required
            value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <input className={input} placeholder="Last name" required
            value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <input className={input} type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className={input} placeholder="Phone"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={input} type="date"
            value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          <button type="submit" disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {submitting ? "Saving..." : "Add student"}
          </button>
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
      </form>

      {loading ? (
        <Spinner label="Loading students..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <p className="text-gray-500">No students yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date of birth</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">{s.firstName} {s.lastName}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.phone ?? "-"}</td>
                  <td className="px-4 py-3">{s.dateOfBirth ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}