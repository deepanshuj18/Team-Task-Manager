import type { TaskPriority, TaskStatus } from "../../types";

const toneMap: Record<string, string> = {
  TODO: "badge-slate",
  IN_PROGRESS: "badge-blue",
  REVIEW: "badge-amber",
  DONE: "badge-green",
  LOW: "badge-slate",
  MEDIUM: "badge-amber",
  HIGH: "badge-rose"
};

export function StatusBadge({ value, label }: { value: TaskStatus | TaskPriority; label?: string }) {
  return <span className={`badge ${toneMap[value]}`}>{label ?? value}</span>;
}
