"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { toastStyles } from "@/lib/theme";

type MessageType = "success" | "error" | "info";

interface Message {
  id: number;
  type: MessageType;
  text: string;
}

interface MessageContextValue {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const MessageContext = createContext<MessageContextValue | null>(null);
const icons = { success: CheckCircle2, error: AlertCircle, info: Info };

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const push = useCallback(
    (type: MessageType, text: string) => {
      const id = nextId.current++;
      setMessages((prev) => [...prev, { id, type, text }]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo<MessageContextValue>(
    () => ({
      success: (t) => push("success", t),
      error: (t) => push("error", t),
      info: (t) => push("info", t),
    }),
    [push]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      >
        {messages.map((m) => {
          const Icon = icons[m.type];
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 text-sm font-medium shadow-lg backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${toastStyles[m.type]}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-xs sm:text-sm leading-snug">{m.text}</p>
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(m.id)}
                className="rounded-lg p-0.5 opacity-70 transition hover:opacity-100"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </MessageContext.Provider>
  );
}

export function useMessages(): MessageContextValue {
  const ctx = useContext(MessageContext);
  if (!ctx) throw new Error("useMessages must be used inside MessageProvider");
  return ctx;
}