export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  createdAt: string;
}

export interface Course {
  id: number;
  courseCode: string;
  title: string;
  description: string | null;
  credits: number;
}

export type Role = "ADMIN" | "LECTURER" | "STUDENT";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
  staffCode?: string;
}