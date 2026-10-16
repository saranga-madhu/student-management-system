import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800 shadow-xs">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs transition-all hover:bg-rose-50 active:scale-[0.98]"
          >
            <RotateCcw size={13} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}