"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "@/lib/api";
import { Course, Student } from "@/types";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const [s, c] = await Promise.all([
        api.get<Student[]>("/students"),
        api.get<Course[]>("/courses"),
      ]);
      setStudents(s.data);
      setCourses(c.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  const recentStudents = students.slice(-5).reverse();
  const recentCourses = courses.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/students" className="rounded-lg bg-white p-5 shadow-sm hover:shadow">
          <p className="text-sm text-gray-500">Total students</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{students.length}</p>
        </Link>
        <Link href="/courses" className="rounded-lg bg-white p-5 shadow-sm hover:shadow">
          <p className="text-sm text-gray-500">Total courses</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{courses.length}</p>
        </Link>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total credits offered</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{totalCredits}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Recent students</h2>
          {recentStudents.length === 0 ? (
            <p className="text-sm text-gray-500">No students yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {recentStudents.map((s) => (
                <li key={s.id} className="py-2">
                  {s.firstName} {s.lastName}
                  <span className="block text-gray-500">{s.email}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-semibold">Recent courses</h2>
          {recentCourses.length === 0 ? (
            <p className="text-sm text-gray-500">No courses yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {recentCourses.map((c) => (
                <li key={c.id} className="py-2">
                  {c.courseCode} - {c.title}
                  <span className="block text-gray-500">{c.credits} credits</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}