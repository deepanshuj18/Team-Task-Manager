import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchUsers } from "../api/users";
import { addProjectMember, fetchProject, removeProjectMember } from "../api/projects";
import { createTask, deleteTask, fetchTask, updateTask, updateTaskStatus } from "../api/tasks";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { StatusBadge } from "../components/common/StatusBadge";
import { TaskForm } from "../components/forms/TaskForm";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import type { Project, Task, TaskStatus, User } from "../types";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "No due date";
}

export function ProjectDetailsPage() {
  const { projectId = "" } = useParams();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";
  const members = useMemo(() => project?.members?.map((member) => member.user) ?? [], [project]);

  async function loadProject() {
    try {
      const [projectResponse, usersResponse] = await Promise.all([
        fetchProject(projectId),
        fetchUsers(isAdmin ? {} : { projectId })
      ]);

      setProject(projectResponse);
      setAvailableUsers(usersResponse);
      if (selectedTask) {
        setSelectedTask(await fetchTask(selectedTask.id));
      }
    } catch {
      pushToast("Unable to load project details.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProject();
  }, [projectId, isAdmin]);

  async function handleCreateTask(values: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate: string | null;
    assigneeId: string | null;
  }) {
    await createTask(projectId, values);
    pushToast("Task created.", "success");
    await loadProject();
  }

  async function handleUpdateTask(values: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate: string | null;
    assigneeId: string | null;
  }) {
    if (!editingTask) {
      return;
    }

    await updateTask(editingTask.id, values);
    setEditingTask(null);
    pushToast("Task updated.", "success");
    await loadProject();
  }

  async function handleDeleteTask(taskId: string) {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    await deleteTask(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
    pushToast("Task deleted.", "success");
    await loadProject();
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    await updateTaskStatus(taskId, status);
    pushToast("Task status updated.", "success");
    await loadProject();
  }

  async function handleAddMember() {
    if (!selectedUserId) {
      return;
    }

    await addProjectMember(projectId, selectedUserId);
    setSelectedUserId("");
    pushToast("Member added to project.", "success");
    await loadProject();
  }

  async function handleRemoveMember(userId: string) {
    await removeProjectMember(projectId, userId);
    pushToast("Member removed from project.", "success");
    await loadProject();
  }

  if (loading) {
    return <Loader label="Loading project..." />;
  }

  if (!project) {
    return <EmptyState title="Project not found" body="This project may have been removed or you may not have access." />;
  }

  const addableUsers = availableUsers.filter(
    (candidate) => !project.members?.some((member) => member.userId === candidate.id)
  );

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">Project detail</span>
          <h1>{project.title}</h1>
          <p>{project.description || "No description provided for this project yet."}</p>
        </div>
        <Link className="button button-secondary" to="/projects">
          Back to projects
        </Link>
      </section>

      <section className="metric-grid">
        <article className="metric-card"><span>Owner</span><strong>{project.owner.name}</strong></article>
        <article className="metric-card"><span>Members</span><strong>{project.memberCount}</strong></article>
        <article className="metric-card"><span>Tasks</span><strong>{project.taskCount}</strong></article>
      </section>

      <section className="split-grid split-grid-wide">
        <div className="stack-gap">
          <div className="panel table-panel">
            <div className="panel-heading"><h2>Tasks</h2></div>
            {!project.tasks?.length ? (
              <EmptyState title="No tasks yet" body="Create a task to start assigning work." />
            ) : (
              <div className="list-stack">
                {project.tasks.map((task) => {
                  const canUpdateStatus = isAdmin || task.assigneeId === user?.id;
                  return (
                    <div
                      key={task.id}
                      className="task-card task-card-clickable"
                      onClick={() => void fetchTask(task.id).then(setSelectedTask)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void fetchTask(task.id).then(setSelectedTask);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="task-card-main">
                        <div>
                          <strong>{task.title}</strong>
                          <p>{task.description || "No task notes."}</p>
                        </div>
                        <div className="task-tags">
                          <StatusBadge value={task.status} label={task.statusLabel} />
                          <StatusBadge value={task.priority} label={task.priorityLabel} />
                          {task.overdue ? <span className="badge badge-rose">Overdue</span> : null}
                        </div>
                      </div>
                      <div className="task-card-footer">
                        <span>{task.assignee?.name || "Unassigned"}</span>
                        <span>{formatDate(task.dueDate)}</span>
                        {canUpdateStatus ? (
                          <select
                            className="status-select"
                            value={task.status}
                            onChange={(event) => void handleStatusChange(task.id, event.target.value as TaskStatus)}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="DONE">Done</option>
                          </select>
                        ) : null}
                        {isAdmin ? (
                          <div className="inline-actions">
                            <button
                              className="button button-secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                setEditingTask(task);
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="button button-danger"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDeleteTask(task.id);
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedTask ? (
            <div className="panel">
              <div className="panel-heading">
                <h2>Task details</h2>
                <button className="button button-secondary" onClick={() => setSelectedTask(null)} type="button">
                  Close
                </button>
              </div>
              <div className="detail-stack">
                <div>
                  <h3>{selectedTask.title}</h3>
                  <p>{selectedTask.description || "No description provided."}</p>
                </div>
                <div className="detail-grid">
                  <div><span>Status</span><strong>{selectedTask.statusLabel}</strong></div>
                  <div><span>Priority</span><strong>{selectedTask.priorityLabel}</strong></div>
                  <div><span>Assignee</span><strong>{selectedTask.assignee?.name || "Unassigned"}</strong></div>
                  <div><span>Due date</span><strong>{formatDate(selectedTask.dueDate)}</strong></div>
                </div>
                <div>
                  <h3>Recent activity</h3>
                  <div className="list-stack compact-list">
                    {selectedTask.activities?.length ? selectedTask.activities.map((activity) => (
                      <div key={activity.id} className="activity-row">
                        <strong>{activity.actor.name}</strong>
                        <p>{activity.message}</p>
                        <span>{new Date(activity.createdAt).toLocaleString()}</span>
                      </div>
                    )) : <p className="muted-text">No recent activity on this task.</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="stack-gap">
          <div className="panel">
            <div className="panel-heading"><h2>Team</h2></div>
            <div className="list-stack compact-list">
              {project.members?.map((member) => (
                <div key={member.id} className="team-row">
                  <div>
                    <strong>{member.user.name}</strong>
                    <p>
                      {member.user.role} · {member.user.email}
                    </p>
                  </div>
                  {isAdmin && project.ownerId !== member.userId ? (
                    <button className="button button-danger" onClick={() => void handleRemoveMember(member.userId)} type="button">
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            {isAdmin ? (
              <div className="team-add-row">
                <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
                  <option value="">Select a user</option>
                  {addableUsers.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name} ({candidate.role})
                    </option>
                  ))}
                </select>
                <button className="button" onClick={() => void handleAddMember()} type="button">
                  Add member
                </button>
              </div>
            ) : null}
          </div>

          {isAdmin ? (
            <TaskForm members={members} submitLabel="Create task" onSubmit={handleCreateTask} />
          ) : null}

          {isAdmin && editingTask ? (
            <TaskForm
              members={members}
              initialTask={editingTask}
              submitLabel="Update task"
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
