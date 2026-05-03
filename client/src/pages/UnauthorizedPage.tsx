import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="center-page">
      <div className="panel narrow-panel">
        <span className="eyebrow">Access denied</span>
        <h1>That action is outside your role.</h1>
        <p>You are authenticated, but the current role does not permit this page or action.</p>
        <Link className="button" to="/dashboard">
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
