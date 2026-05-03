import { useToast } from "../../hooks/useToast";

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={`toast toast-${toast.tone}`}
          onClick={() => removeToast(toast.id)}
          type="button"
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
