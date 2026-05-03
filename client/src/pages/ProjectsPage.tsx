import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createProject, deleteProject, fetchProjects, updateProject } from "../api/projects";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { ProjectForm } from "../components/forms/ProjectForm";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import type { Project } from "../types";

export function ProjectsPage() {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const isAdmin = user?.role === "ADMIN";
  const introCopy = useMemo(
    () =>
      isAdmin
        ? "Create projects, manage scope, and keep team capacity visible."
        : "Review the projects you belong to and keep assigned work moving.",
    [isAdmin]
  );

  async function loadProjects() {
    try {
      setProjects(await fetchProjects());
    } catch {
      pushToast("Unable to load projects.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleCreate(values: { title: string; description: string }) {
    await createProject(values);
    pushToast("Project created.", "success");
    await loadProjects();
  }

  async function handleUpdate(values: { title: string; description: string }) {
    if (!editingProject) {
      return;
    }

    await updateProject(editingProject.id, values);
    setEditingProject(null);
    pushToast("Project updated.", "success");
    await loadProjects();
  }

  async function handleDelete(projectId: string) {
    if (!window.confirm("Delete this project and all of its tasks?")) {
      return;
    }

    await deleteProject(projectId);
    pushToast("Project deleted.", "success");
    await loadProjects();
  }

  if (loading) {
    return <Loader label="Loading projects..." />;
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">Projects</span>
          <h1>Project portfolio</h1>
          <p>{introCopy}</p>
        </div>
      </section>

      <section className="split-grid split-grid-wide">
        <div className="panel table-panel">
          <div className="panel-heading"><h2>All visible projects</h2></div>
          {projects.length === 0 ? (
            <EmptyState title="No projects yet" body="Create a project to begin assigning work." />
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article key={project.id} className="project-card">
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.description || "No description added."}</p>
                  </div>
                  <div className="project-meta">
                    <span>{project.memberCount} members</span>
                    <span>{project.taskCount} tasks</span>
                  </div>
                  <div className="card-actions">
                    <Link className="button button-secondary" to={`/projects/${project.id}`}>
                      Open
                    </Link>
                    {isAdmin ? (
                      <>
                        <button className="button button-secondary" onClick={() => setEditingProject(project)} type="button">
                          Edit
                        </button>
                        <button className="button button-danger" onClick={() => void handleDelete(project.id)} type="button">
                          Delete
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {isAdmin ? (
          <div className="stack-gap">
            <ProjectForm submitLabel="Create project" onSubmit={handleCreate} />
            {editingProject ? (
              <ProjectForm
                submitLabel="Update project"
                initialValues={{ title: editingProject.title, description: editingProject.description ?? "" }}
                onSubmit={handleUpdate}
                onCancel={() => setEditingProject(null)}
              />
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
