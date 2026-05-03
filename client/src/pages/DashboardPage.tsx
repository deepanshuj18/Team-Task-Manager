import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDashboardSummary } from "../api/dashboard";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { StatusBadge } from "../components/common/StatusBadge";
import { useToast } from "../hooks/useToast";
import type { DashboardSummary } from "../types";

const statusCards = [
  { key: "TODO", label: "Todo" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "DONE", label: "Done" }
] as const;

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "No due date";
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    async function loadSummary() {
      try {
        setSummary(await fetchDashboardSummary());
      } catch {
        pushToast("Unable to load dashboard summary.", "error");
      } finally {
        setLoading(false);
      }
    }

    void loadSummary();
  }, [pushToast]);

  if (loading) {
    return <Loader label="Loading dashboard..." />;
  }

  if (!summary) {
    return <EmptyState title="No dashboard data" body="The dashboard summary could not be loaded." />;
  }

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <span className="eyebrow">Operations snapshot</span>
          <h1>Keep execution visible across projects.</h1>
        </div>
        <p>Track volume, bottlenecks, and tasks that need intervention before they slip further.</p>
      </section>

      <section className="metric-grid">
        <article className="metric-card"><span>Total projects</span><strong>{summary.totalProjects}</strong></article>
        <article className="metric-card"><span>Total tasks</span><strong>{summary.totalTasks}</strong></article>
        <article className="metric-card"><span>Overdue tasks</span><strong>{summary.overdueTasks}</strong></article>
        <article className="metric-card"><span>Due soon</span><strong>{summary.dueSoonTasks}</strong></article>
        <article className="metric-card"><span>Assigned to you</span><strong>{summary.assignedToMe}</strong></article>
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-heading"><h2>Tasks by status</h2></div>
          <div className="status-grid">
            {statusCards.map((card) => (
              <div key={card.key} className="status-tile">
                <span>{card.label}</span>
                <strong>{summary.tasksByStatus[card.key] ?? 0}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading"><h2>Your tasks</h2></div>
          {summary.myTasks.length === 0 ? (
            <EmptyState title="No assigned tasks" body="Tasks assigned to you will appear here." />
          ) : (
            <div className="list-stack">
              {summary.myTasks.map((task) => (
                <Link key={task.id} className="task-row" to={`/projects/${task.projectId}`}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      {task.project?.title} · {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <StatusBadge value={task.status} label={task.statusLabel} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><h2>Recent activity</h2></div>
        {summary.recentActivity.length === 0 ? (
          <EmptyState title="No recent activity" body="Task changes will appear here." />
        ) : (
          <div className="list-stack">
            {summary.recentActivity.map((activity) => (
              <div key={activity.id} className="activity-row">
                <strong>{activity.actor.name}</strong>
                <p>{activity.message}</p>
                <span>
                  {activity.task?.project?.title ?? "Project"} · {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
