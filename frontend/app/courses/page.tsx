"use client";

import { FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { Course, Enrollment } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";

import { 
  BookOpen, 
  CheckCircle2, 
  MinusCircle, 
  Pencil, 
  Plus, 
  Trash2, 
  Users 
} from "lucide-react";
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

const emptyForm = { courseCode: "", title: "", description: "", credits: "" };

export default function CoursesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole("ADMIN", "LECTURER");
  const isStudent = hasRole("STUDENT");

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [courseStudents, setCourseStudents] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  async function loadCourses() {
    try {
      const res = await api.get<Course[]>("/courses");
      setError("");
      setCourses(res.data);
      if (isStudent) {
        const mine = await api.get<Enrollment[]>("/enrollments/me");
        setEnrolledIds(new Set(mine.data.map((e) => e.courseId)));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent]);

  function startEdit(c: Course) {
    setEditingId(c.id);
    setForm({
      courseCode: c.courseCode,
      title: c.title,
      description: c.description ?? "",
      credits: String(c.credits),
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
      courseCode: form.courseCode,
      title: form.title,
      description: form.description || null,
      credits: Number(form.credits),
    };
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
      } else {
        await api.post("/courses", payload);
      }
      resetForm();
      await loadCourses();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) resetForm();
      if (selectedCourse?.id === id) {
        setSelectedCourse(null);
        setCourseStudents([]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function toggleEnroll(course: Course) {
    setEnrollingId(course.id);
    try {
      if (enrolledIds.has(course.id)) {
        await api.delete(`/enrollments/course/${course.id}`);
        setEnrolledIds((prev) => {
          const next = new Set(prev);
          next.delete(course.id);
          return next;
        });
      } else {
        await api.post("/enrollments", { courseId: course.id });
        setEnrolledIds((prev) => new Set(prev).add(course.id));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEnrollingId(null);
    }
  }

  async function viewEnrolled(course: Course) {
    setSelectedCourse(course);
    try {
      const res = await api.get<Enrollment[]>(`/enrollments/course/${course.id}`);
      setCourseStudents(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Courses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse academic catalog, review course credits, and manage curriculum offerings.
        </p>
      </div>

      {canManage && (
        <form onSubmit={handleSubmit} className={`${card} p-6`}>
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            {editingId ? (
              <Pencil size={18} className="text-indigo-600" />
            ) : (
              <Plus size={18} className="text-indigo-600" />
            )}
            <h2 className="font-semibold text-slate-900">
              {editingId ? "Edit course details" : "Add new course"}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Course Code</label>
              <input
                className={inputClass}
                placeholder="e.g. CS101"
                required
                value={form.courseCode}
                onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Course Title</label>
              <input
                className={inputClass}
                placeholder="e.g. Introduction to Computer Science"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Credits</label>
              <input
                className={inputClass}
                type="number"
                min={1}
                placeholder="Credits"
                required
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description (optional)</label>
              <input
                className={inputClass}
                placeholder="Brief summary of course content and objectives"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2.5">
              <button type="submit" disabled={submitting} className={primaryBtn}>
                {submitting ? "Saving..." : editingId ? "Save changes" : "Create course"}
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
      )}

      {loading ? (
        <Spinner label="Loading courses..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCourses} />
      ) : courses.length === 0 ? (
        <div className={`${card} p-12 text-center`}>
          <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">No courses available yet.</p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className={tableHeader}>Code</th>
                  <th className={tableHeader}>Title</th>
                  <th className={tableHeader}>Description</th>
                  <th className={tableHeader}>Credits</th>
                  <th className={`${tableHeader} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => {
                  const enrolled = enrolledIds.has(c.id);
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50/60">
                      <td className={tableCell}>
                        <span className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-xs font-bold text-indigo-700">
                          {c.courseCode}
                        </span>
                      </td>
                      <td className={`${tableCell} font-semibold text-slate-900`}>{c.title}</td>
                      <td className={`${tableCell} max-w-xs truncate text-slate-500`}>
                        {c.description || <span className="text-slate-300">—</span>}
                      </td>
                      <td className={tableCell}>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {c.credits} credits
                        </span>
                      </td>
                      <td className={`${tableCell} text-right whitespace-nowrap`}>
                        <div className="inline-flex items-center gap-2">
                          {isStudent && (
                            <button
                              onClick={() => toggleEnroll(c)}
                              disabled={enrollingId === c.id}
                              className={
                                enrolled
                                  ? dangerBtn
                                  : "inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
                              }
                            >
                              {enrollingId === c.id ? (
                                "Saving..."
                              ) : enrolled ? (
                                <>
                                  <MinusCircle size={13} />
                                  Unenroll
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={13} />
                                  Enroll
                                </>
                              )}
                            </button>
                          )}
                          {canManage && (
                            <>
                              <button
                                onClick={() => viewEnrolled(c)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                              >
                                <Users size={12} className="text-slate-500" />
                                Enrolled
                              </button>
                              <button onClick={() => startEdit(c)} className={editBtn}>
                                <Pencil size={12} />
                                Edit
                              </button>
                              <button onClick={() => handleDelete(c.id)} className={dangerBtn}>
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {canManage && selectedCourse && (
        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">
                Enrolled Students: <span className="text-indigo-600">{selectedCourse.courseCode}</span> {selectedCourse.title}
              </h2>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              {courseStudents.length} Students
            </span>
          </div>
          {courseStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No students are currently enrolled in this course.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {courseStudents.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
                      {e.studentName?.[0] || "S"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{e.studentName}</p>
                      <p className="text-xs text-slate-500">{e.studentEmail}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
