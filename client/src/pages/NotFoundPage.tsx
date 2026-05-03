import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="center-page">
      <div className="panel narrow-panel">
        <span className="eyebrow">404</span>
        <h1>Page not found</h1>
        <p>The page you requested does not exist or has been moved.</p>
        <Link className="button" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
