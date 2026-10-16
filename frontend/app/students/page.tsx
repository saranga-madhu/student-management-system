"use client";

import { FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { Student } from "@/types";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";

import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { 
  card, 
  dangerBtn, 
  editBtn, 
  inputClass, 
  labelClass, 
  primaryBtn, 
  secondaryBtn, 
  tableCell, 
  tableHeader 
} from "@/lib/theme";

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
  const [editingId, setEditingId] = useState<number | null>(null);
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

  function startEdit(s: Student) {
    setEditingId(s.id);
    setForm({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone ?? "",
      dateOfBirth: s.dateOfBirth ?? "",
    });
    setFormError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    const payload = {
      ...form,
      phone: form.phone || null,
      dateOfBirth: form.dateOfBirth || null,
    };
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
      } else {
        await api.post("/students", payload);
      }
      resetForm();
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
      if (editingId === id) resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Students</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage enrolled students records, contact info, and registration details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`${card} p-6`}>
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          {editingId ? (
            <Pencil size={18} className="text-indigo-600" />
          ) : (
            <Plus size={18} className="text-indigo-600" />
          )}
          <h2 className="font-semibold text-slate-900">
            {editingId ? "Edit student details" : "Register new student"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Sarah"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Connor"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input
              className={inputClass}
              type="email"
              placeholder="e.g. sarah@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Phone (optional)</label>
            <input
              className={inputClass}
              placeholder="e.g. +1 555-0199"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth (optional)</label>
            <input
              className={inputClass}
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>
          <div className="flex items-end gap-2.5">
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Add student"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={secondaryBtn}>
                Cancel
              </button>
            )}
          </div>
        </div>
        {formError && (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {formError}
          </p>
        )}
      </form>

      {loading ? (
        <Spinner label="Loading students..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <Users className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No students found.</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className={tableHeader}>Student</th>
                  <th className={tableHeader}>Email</th>
                  <th className={tableHeader}>Phone</th>
                  <th className={tableHeader}>Date of birth</th>
                  <th className={`${tableHeader} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-slate-50/60">
                    <td className={tableCell}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                          {s.firstName?.[0]}
                          {s.lastName?.[0]}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    </td>
                    <td className={`${tableCell} text-slate-600`}>{s.email}</td>
                    <td className={`${tableCell} text-slate-600`}>
                      {s.phone || <span className="text-slate-300">—</span>}
                    </td>
                    <td className={`${tableCell} text-slate-600`}>
                      {s.dateOfBirth || <span className="text-slate-300">—</span>}
                    </td>
                    <td className={`${tableCell} text-right whitespace-nowrap`}>
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => startEdit(s)} className={editBtn}>
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(s.id)} className={dangerBtn}>
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
