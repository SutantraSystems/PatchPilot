"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { JobLogEntry } from "@/types/job";

const LEVEL_STYLES: Record<JobLogEntry["level"], string> = {
  info: "bg-slate-300",
  warn: "bg-amber-400",
  error: "bg-red-500",
};

const LEVEL_TEXT: Record<JobLogEntry["level"], string> = {
  info: "text-slate-700",
  warn: "text-amber-700",
  error: "text-red-700",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function JobLogTimeline({ logs }: { logs: JobLogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [logs.length]);

  return (
    <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
      {logs.length === 0 && (
        <p className="text-sm text-slate-400">No log entries yet.</p>
      )}
      {logs.map((entry, i) => (
        <div key={`${entry.timestamp}-${i}`} className="flex gap-3 text-sm">
          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ring-2 ring-white">
            <span
              className={clsx("block h-2 w-2 rounded-full", LEVEL_STYLES[entry.level])}
            />
          </span>
          <div className="flex-1">
            <span className={clsx("font-medium", LEVEL_TEXT[entry.level])}>
              {entry.message}
            </span>
            <span className="ml-2 text-xs text-slate-400">
              {formatTime(entry.timestamp)}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
