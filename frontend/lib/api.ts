import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.response) {
      return err.response.data?.message ?? `Request failed (status ${err.response.status})`;
    }
    if (err.request) {
      return "Cannot reach the server. Is the backend running?";
    }
  }
  return "Something went wrong. Please try again.";
}

export default api;