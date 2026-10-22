"use client";

import { FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage, getFieldErrors } from "@/lib/api";
import { Student } from "@/types";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";
import Field from "@/components/Field";
import { useAuth } from "@/context/AuthContext";
import { useMessages } from "@/context/MessageContext";
import { Check, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import {
  card,
  dangerBtn,
  editBtn,
  fieldInputClass,
  primaryBtn,
  secondaryBtn,
  statusBadge,
  tableCell,
  tableHeader,
} from "@/lib/theme";
import {
  FieldErrors,
  dateOfBirth,
  email,
  firstError,
  personName,
  phone,
} from "@/lib/validation";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
};

export default function StudentsPage() {
  const { hasRole } = useAuth();
  const messages = useMessages();
  const isAdmin = hasRole("ADMIN");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  async function loadStudents() {
    try {
      const res = await api.get<Student[]>("/students");
      setError("");
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
    setErrors({});
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const first = personName(form.firstName, "First name");
    const last = personName(form.lastName, "Last name");
    const mail = email(form.email);
    const phoneErr = phone(form.phone);
    const dobErr = dateOfBirth(form.dateOfBirth);
    if (first) next.firstName = first;
    if (last) next.lastName = last;
    if (mail) next.email = mail;
    if (phoneErr) next.phone = phoneErr;
    if (dobErr) next.dateOfBirth = dobErr;
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
    const payload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone || null,
      dateOfBirth: form.dateOfBirth || null,
    };
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
        messages.success("Student updated");
      } else {
        await api.post("/students", payload);
        messages.success("Student added");
      }
      resetForm();
      await loadStudents();
    } catch (err) {
      setErrors(getFieldErrors(err));
      messages.error(getErrorMessage(err));
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
      messages.success("Student deleted");
    } catch (err) {
      messages.error(getErrorMessage(err));
    }
  }

  async function updateStatus(id: number, action: "approve" | "reject") {
    setStatusUpdating(id);
    try {
      await api.put(`/students/${id}/${action}`);
      messages.success(action === "approve" ? "Student approved" : "Student rejected");
      await loadStudents();
    } catch (err) {
      messages.error(getErrorMessage(err));
    } finally {
      setStatusUpdating(null);
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

      <form onSubmit={handleSubmit} noValidate className={`${card} p-6`}>
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
          <Field label="First Name" error={errors.firstName}>
            <input
              className={fieldInputClass(errors.firstName)}
              placeholder="e.g. Sarah"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </Field>
          <Field label="Last Name" error={errors.lastName}>
            <input
              className={fieldInputClass(errors.lastName)}
              placeholder="e.g. Connor"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </Field>
          <Field label="Email Address" error={errors.email}>
            <input
              className={fieldInputClass(errors.email)}
              type="email"
              placeholder="e.g. sarah@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone (optional, 10 digits)" error={errors.phone}>
            <input
              className={fieldInputClass(errors.phone)}
              placeholder="e.g. 0771234567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Date of Birth (optional, age 18-30)" error={errors.dateOfBirth}>
            <input
              className={fieldInputClass(errors.dateOfBirth)}
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </Field>
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
                  <th className={tableHeader}>Status</th>
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
                    <td className={tableCell}>
                      <span className={statusBadge[s.status ?? "APPROVED"]}>{s.status ?? "APPROVED"}</span>
                    </td>
                    <td className={`${tableCell} text-right whitespace-nowrap`}>
                      <div className="inline-flex items-center gap-2">
                        {isAdmin && s.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => updateStatus(s.id, "approve")}
                              disabled={statusUpdating === s.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.98] disabled:opacity-50"
                            >
                              <Check size={12} />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(s.id, "reject")}
                              disabled={statusUpdating === s.id}
                              className={dangerBtn}
                            >
                              <X size={12} />
                              Reject
                            </button>
                          </>
                        )}
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
