import { useEffect, useState } from "react";
import type { FormEvent } from "react";

export function ProjectForm({
  initialValues,
  onSubmit,
  submitLabel,
  onCancel
}: {
  initialValues?: { title: string; description: string };
  submitLabel: string;
  onSubmit: (values: { title: string; description: string }) => Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit({ title, description });
      if (!initialValues) {
        setTitle("");
        setDescription("");
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
        Project title
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label>
        Description
        <textarea rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
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
