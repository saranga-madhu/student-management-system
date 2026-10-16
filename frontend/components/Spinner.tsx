export default function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
      <span className="text-xs font-medium tracking-wide text-slate-500">{label}</span>
    </div>
  );
}