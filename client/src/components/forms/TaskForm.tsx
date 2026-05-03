import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskPriority, TaskStatus, User } from "../../types";

const statusOptions: TaskStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
const priorityOptions: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

function toInputDate(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function toIsoDate(value: string) {
  return value ? new Date(`${value}T12:00:00.000Z`).toISOString() : null;
}

export function TaskForm({
  members,
  initialTask,
  submitLabel,
  onSubmit,
  onCancel
}: {
  members: User[];
  initialTask?: Task;
  submitLabel: string;
  onSubmit: (values: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    assigneeId: string | null;
  }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(initialTask?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(toInputDate(initialTask?.dueDate));
  const [assigneeId, setAssigneeId] = useState(initialTask?.assigneeId ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialTask?.title ?? "");
    setDescription(initialTask?.description ?? "");
    setStatus(initialTask?.status ?? "TODO");
    setPriority(initialTask?.priority ?? "MEDIUM");
    setDueDate(toInputDate(initialTask?.dueDate));
    setAssigneeId(initialTask?.assigneeId ?? "");
  }, [initialTask]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({
        title,
        description,
        status,
        priority,
        dueDate: toIsoDate(dueDate),
        assigneeId: assigneeId || null
      });
      if (!initialTask) {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("MEDIUM");
        setDueDate("");
        setAssigneeId("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <h3>{submitLabel}</h3>
      </div>
      <label>
        Task title
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Description
        <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <div className="form-row">
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
            {priorityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Due date
          <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
        <label>
          Assignee
          <select value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)}>
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-actions">
        {onCancel ? (
          <button className="button button-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
        ) : null}
        <button className="button" disabled={submitting} type="submit">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
