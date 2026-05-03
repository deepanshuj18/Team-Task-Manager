import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

export function SignupPage() {
  const { signup } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await signup({ name, email, password });
      pushToast("Account created successfully.", "success");
      navigate("/dashboard", { replace: true });
    } catch {
      pushToast("Unable to create the account.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel auth-hero">
        <span className="eyebrow">Launch organized teamwork fast</span>
        <h1>Build a shared delivery system in minutes.</h1>
        <p>Sign up as a member, join a project, and keep status updates flowing back into a single dashboard.</p>
      </section>
      <form className="auth-panel auth-form" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        <label>
          Full name
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="button" disabled={submitting} type="submit">
          {submitting ? "Creating..." : "Create account"}
        </button>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
