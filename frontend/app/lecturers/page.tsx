"use client";

import { FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "@/lib/api";
import { User } from "@/types";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";
import Field from "@/components/Field";
import { useMessages } from "@/context/MessageContext";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import {
  card,
  dangerBtn,
  editBtn,
  fieldInputClass,
  primaryBtn,
  secondaryBtn,
  tableCell,
  tableHeader,
} from "@/lib/theme";
import { FieldErrors, email, firstError, password, personName, username } from "@/lib/validation";

const emptyForm = {
  username: "",
  fullName: "",
  email: "",
  password: "",
};

export default function LecturersPage() {
  const messages = useMessages();
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function loadLecturers() {
    try {
      const res = await api.get<User[]>("/lecturers");
      setError("");
      setLecturers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLecturers();
  }, []);

  function startEdit(u: User) {
    setEditingId(u.id);
    setForm({ username: u.username, fullName: u.fullName, email: u.email, password: "" });
    setErrors({});
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!editingId) {
      const userErr = username(form.username);
      if (userErr) next.username = userErr;
    }
    const nameErr = personName(form.fullName, "Full name");
    const emailErr = email(form.email);
    const passErr = password(form.password, { required: !editingId });
    if (nameErr) next.fullName = nameErr;
    if (emailErr) next.email = emailErr;
    if (passErr) next.password = passErr;
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
    setSubmitting(true);
    setErrors({});
    try {
      if (editingId) {
        await api.put(`/lecturers/${editingId}`, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password || undefined,
        });
        messages.success("Lecturer updated");
      } else {
        await api.post("/lecturers", {
          username: form.username.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        });
        messages.success("Lecturer added");
      }
      resetForm();
      await loadLecturers();
    } catch (err) {
      setErrors(getFieldErrors(err));
      messages.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this lecturer account?")) return;
    try {
      await api.delete(`/lecturers/${id}`);
      setLecturers((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) resetForm();
      messages.success("Lecturer deleted");
    } catch (err) {
      messages.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Lecturers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Faculty members management, account credentials, and teaching staff directories.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className={`${card} p-6`}>
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          {editingId ? (
            <Pencil size={18} className="text-indigo-600" />
          ) : (
            <Plus size={18} className="text-indigo-600" />
          )}
          <h2 className="font-semibold text-slate-900">
            {editingId ? "Edit faculty member" : "Add faculty member"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Username" error={errors.username}>
            <input
              className={fieldInputClass(errors.username)}
              placeholder="e.g. jdoe"
              disabled={!!editingId}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
          <Field label="Full Name" error={errors.fullName}>
            <input
              className={fieldInputClass(errors.fullName)}
              placeholder="e.g. John Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input
              className={fieldInputClass(errors.email)}
              type="email"
              placeholder="e.g. jdoe@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label={editingId ? "New Password (optional)" : "Password (min 8 chars)"} error={errors.password}>
            <input
              className={fieldInputClass(errors.password)}
              type="password"
              placeholder={editingId ? "Leave blank to keep unchanged" : "••••••••"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <div className="flex items-end gap-2.5 sm:col-span-2 lg:col-span-1">
            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Add lecturer"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={secondaryBtn}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {loading ? (
        <Spinner label="Loading lecturers..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadLecturers} />
      ) : lecturers.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <UserCog className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No lecturers found.</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className={tableHeader}>Faculty Member</th>
                  <th className={tableHeader}>Username</th>
                  <th className={tableHeader}>Email</th>
                  <th className={`${tableHeader} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lecturers.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-slate-50/60">
                    <td className={tableCell}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-700">
                          {l.fullName?.[0] || "L"}
                        </div>
                        <span className="font-semibold text-slate-900">{l.fullName}</span>
                      </div>
                    </td>
                    <td className={tableCell}>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                        @{l.username}
                      </span>
                    </td>
                    <td className={`${tableCell} text-slate-600`}>{l.email}</td>
                    <td className={`${tableCell} text-right whitespace-nowrap`}>
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => startEdit(l)} className={editBtn}>
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(l.id)} className={dangerBtn}>
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
