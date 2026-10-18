"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ArrowRight, 
  Award, 
  BookCheck, 
  BookOpen, 
  GraduationCap, 
  UserCog, 
  Users 
} from "lucide-react";
import api, { getErrorMessage } from "@/lib/api";
import { Course, Enrollment, Student, User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { card } from "@/lib/theme";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ErrorMessage";

export default function DashboardPage() {
  const { user, hasRole } = useAuth();
  const isStudent = hasRole("STUDENT");
  const isAdmin = hasRole("ADMIN");

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      if (isStudent) {
        const [c, e] = await Promise.all([
          api.get<Course[]>("/courses"),
          api.get<Enrollment[]>("/enrollments/me"),
        ]);
        setError("");
        setCourses(c.data);
        setEnrollments(e.data);
      } else {
        const requests: Promise<unknown>[] = [
          api.get<Student[]>("/students").then((r) => setStudents(r.data)),
          api.get<Course[]>("/courses").then((r) => setCourses(r.data)),
        ];
        if (isAdmin) {
          requests.push(api.get<User[]>("/lecturers").then((r) => setLecturers(r.data)));
        }
        await Promise.all(requests);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent, isAdmin]);

  if (loading) return <Spinner label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadData} />;

  if (isStudent) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {user?.fullName || "Student"}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your course enrollments and discover available programs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Link
            href="/courses"
            className={`${card} group relative overflow-hidden p-6 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Available courses
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{courses.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <BookOpen size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline">
              <span>Browse catalog</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          <Link
            href="/courses"
            className={`${card} group relative overflow-hidden p-6 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  My enrollments
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{enrollments.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <BookCheck size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:underline">
              <span>Manage enrollments</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="text-indigo-600" size={20} />
              <h2 className="font-semibold text-slate-900">Enrolled courses</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {enrollments.length} Active
            </span>
          </div>

          {enrollments.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">You have not enrolled in any courses yet.</p>
              <Link
                href="/courses"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Explore courses <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {enrollments.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {e.courseCode}
                    </span>
                    <span className="font-medium text-slate-800">{e.courseTitle}</span>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {e.credits} credits
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits ?? 0), 0);
  const recentStudents = students.slice(-5).reverse();
  const recentCourses = courses.slice(-5).reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Overview Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor your institution metrics, students, and course listings.
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <Link
          href="/students"
          className={`${card} group p-6 hover:-translate-y-0.5 hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total students
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{students.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:underline">
            <span>View all students</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        <Link
          href="/courses"
          className={`${card} group p-6 hover:-translate-y-0.5 hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total courses
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{courses.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <BookOpen size={22} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:underline">
            <span>Manage catalog</span>
            <ArrowRight size={13} />
          </div>
        </Link>

        {isAdmin && (
          <Link
            href="/lecturers"
            className={`${card} group p-6 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lecturers
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{lecturers.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                <UserCog size={22} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:underline">
              <span>View faculty</span>
              <ArrowRight size={13} />
            </div>
          </Link>
        )}

        <div className={`${card} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Credits offered
              </p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">{totalCredits}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Award size={22} />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Total institutional curriculum</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Recent students</h2>
            </div>
            <Link href="/students" className="text-xs font-semibold text-indigo-600 hover:underline">
              See all
            </Link>
          </div>
          {recentStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No students registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {recentStudents.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {s.firstName?.[0]}
                      {s.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${card} p-6`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-600" />
              <h2 className="font-semibold text-slate-900">Recent courses</h2>
            </div>
            <Link href="/courses" className="text-xs font-semibold text-emerald-600 hover:underline">
              See all
            </Link>
          </div>
          {recentCourses.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No courses listed yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 text-sm">
              {recentCourses.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      {c.courseCode}
                    </span>
                    <span className="font-medium text-slate-800">{c.title}</span>
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {c.credits} cr
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
