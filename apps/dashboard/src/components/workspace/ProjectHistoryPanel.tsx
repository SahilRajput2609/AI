// src/components/workspace/ProjectHistoryPanel.tsx
import { clsx } from "../utils/clsx";
import { X } from "lucide-react";

export interface HistoryEntry {
  prompt: string;
  outcome: "completed" | "rejected";
  timestamp: string; // ISO string
}

interface Props {
  history: HistoryEntry[];
  onClose: () => void;
}

export function ProjectHistoryPanel({ history, onClose }: Props) {
  const sorted = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 right-0 w-80 bg-zinc-950/90 backdrop-blur-lg border-l border-white/5 shadow-lg transition-transform duration-300",
        "z-50 flex flex-col"
      )}
      aria-label="Project history panel"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-sm font-medium text-white uppercase">History</h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1"
          aria-label="Close history panel"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center">No history yet.</p>
        ) : (
          sorted.map((entry, idx) => (
            <div key={idx} className="border border-white/5 rounded p-2 bg-zinc-900/40">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">{new Date(entry.timestamp).toLocaleString()}</span>
                <span className={clsx(
                  "text-xs font-semibold px-1 rounded",
                  entry.outcome === "completed" ? "bg-emerald-600/30 text-emerald-400" : "bg-rose-600/30 text-rose-400"
                )}>
                  {entry.outcome}
                </span>
              </div>
              <p className="mt-1 text-[0.78rem] text-white break-words">{entry.prompt}</p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
