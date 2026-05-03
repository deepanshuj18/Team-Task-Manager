import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export function LoginPage() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/dashboard";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login({ email, password });
      pushToast("Welcome back.", "success");
      navigate(from, { replace: true });
    } catch {
      pushToast("Unable to sign in with those credentials.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel auth-hero">
        <span className="eyebrow">Delivery visibility for real teams</span>
        <h1>Move projects forward without losing ownership.</h1>
        <p>
          Team Task Manager gives admins a structured workspace and gives members a clear, narrow view of the work they own.
        </p>
      </section>
      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <h2>Log in</h2>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="button" disabled={submitting} type="submit">
          {submitting ? "Signing in..." : "Log in"}
        </button>
        <p className="auth-footer">
          Need an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}
