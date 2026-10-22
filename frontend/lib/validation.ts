export const PERSON_NAME = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;
export const USERNAME = /^[a-zA-Z0-9._-]{3,50}$/;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE = /^\d{10}$/;
export const COURSE_CODE = /^[A-Za-z0-9-]{2,20}$/;

export type FieldErrors = Record<string, string>;

export function required(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required`;
  return null;
}

export function personName(value: string, label: string): string | null {
  const missing = required(value, label);
  if (missing) return missing;
  const trimmed = value.trim();
  if (trimmed.length > 100) return `${label} must be at most 100 characters`;
  if (!PERSON_NAME.test(trimmed)) return `${label} can contain letters only (no numbers)`;
  return null;
}

export function username(value: string): string | null {
  const missing = required(value, "Username");
  if (missing) return missing;
  if (value.trim().length < 3) return "Username must be at least 3 characters";
  if (!USERNAME.test(value.trim())) {
    return "Username may contain letters, numbers, dots, hyphens, and underscores only";
  }
  return null;
}

export function email(value: string): string | null {
  const missing = required(value, "Email");
  if (missing) return missing;
  if (!EMAIL.test(value.trim())) return "Enter a valid email address";
  return null;
}

export function password(value: string, { required: isRequired = true }: { required?: boolean } = {}): string | null {
  if (!value) return isRequired ? "Password is required" : null;
  if (value.length < 8) return "Password must be at least 8 characters";
  if (value.length > 100) return "Password must be at most 100 characters";
  return null;
}

export function confirmPassword(value: string, original: string): string | null {
  if (value !== original) return "Passwords do not match";
  return null;
}

export function phone(value: string): string | null {
  if (!value.trim()) return null;
  if (!PHONE.test(value.trim())) return "Phone number must be exactly 10 digits";
  return null;
}

export function dateOfBirth(value: string): string | null {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return "Enter a valid date of birth";
  const today = new Date();
  if (dob > today) return "Date of birth must be in the past";
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age -= 1;
  if (age < 18 || age > 30) return "Student age must be between 18 and 30 years";
  return null;
}

export function courseCode(value: string): string | null {
  const missing = required(value, "Course code");
  if (missing) return missing;
  if (!COURSE_CODE.test(value.trim())) return "Course code may contain letters, numbers, and hyphens only";
  return null;
}

export function credits(value: string): string | null {
  const missing = required(value, "Credits");
  if (missing) return missing;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return "Credits must be at least 1";
  if (n > 30) return "Credits must be at most 30";
  return null;
}

export function firstError(errors: FieldErrors): string | null {
  const values = Object.values(errors).filter(Boolean);
  return values[0] ?? null;
}
