import { ReactNode } from "react";
import { labelClass } from "@/lib/theme";

export default function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}