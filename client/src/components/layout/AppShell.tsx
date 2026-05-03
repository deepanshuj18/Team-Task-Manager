import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand-mark">TT</span>
          <div>
            <strong>Team Task Manager</strong>
            <p>Project control center</p>
          </div>
        </Link>
        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{user?.name}</strong>
            <p>
              {user?.role} · {user?.email}
            </p>
          </div>
          <button className="button button-secondary" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="content-shell">
        <Outlet />
      </main>
    </div>
  );
}
