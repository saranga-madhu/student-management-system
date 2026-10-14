"use client";

import { FormEvent, useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { Course } from "@/types";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";

const emptyForm = { courseCode: "", title: "", description: "", credits: "" };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadCourses() {
    try {
      setError("");
      const res = await api.get<Course[]>("/courses");
      setCourses(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/courses", {
        courseCode: form.courseCode,
        title: form.title,
        description: form.description || null,
        credits: Number(form.credits),
      });
      setForm(emptyForm);
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
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const input = "w-full rounded border border-gray-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Courses</h1>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Add course</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input className={input} placeholder="Course code (e.g. CS101)" required
            value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
          <input className={input} placeholder="Title" required
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className={input} type="number" min={1} placeholder="Credits" required
            value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
          <input className={`${input} sm:col-span-2`} placeholder="Description"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button type="submit" disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
            {submitting ? "Saving..." : "Add course"}
          </button>
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
      </form>

      {loading ? (
        <Spinner label="Loading courses..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadCourses} />
      ) : courses.length === 0 ? (
        <p className="text-gray-500">No courses yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3">{c.courseCode}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3">{c.description ?? "-"}</td>
                  <td className="px-4 py-3">{c.credits}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)}
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