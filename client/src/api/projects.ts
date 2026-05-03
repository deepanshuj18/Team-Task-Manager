import { http } from "./http";
import type { Project } from "../types";

export async function fetchProjects() {
  const { data } = await http.get<{ projects: Project[] }>("/projects");
  return data.projects;
}

export async function fetchProject(projectId: string) {
  const { data } = await http.get<{ project: Project }>(`/projects/${projectId}`);
  return data.project;
}

export async function createProject(payload: { title: string; description?: string | null }) {
  const { data } = await http.post<{ project: Project }>("/projects", payload);
  return data.project;
}

export async function updateProject(projectId: string, payload: { title: string; description?: string | null }) {
  const { data } = await http.patch<{ project: Project }>(`/projects/${projectId}`, payload);
  return data.project;
}

export async function deleteProject(projectId: string) {
  await http.delete(`/projects/${projectId}`);
}

export async function addProjectMember(projectId: string, userId: string) {
  const { data } = await http.post<{ project: Project }>(`/projects/${projectId}/members`, { userId });
  return data.project;
}

export async function removeProjectMember(projectId: string, userId: string) {
  const { data } = await http.delete<{ project: Project }>(`/projects/${projectId}/members/${userId}`);
  return data.project;
}
