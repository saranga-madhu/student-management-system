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