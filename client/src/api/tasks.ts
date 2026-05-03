import { http } from "./http";
import type { Task } from "../types";

export type TaskPayload = {
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  assigneeId?: string | null;
};

export async function fetchTask(taskId: string) {
  const { data } = await http.get<{ task: Task }>(`/tasks/${taskId}`);
  return data.task;
}

export async function createTask(projectId: string, payload: TaskPayload) {
  const { data } = await http.post<{ task: Task }>(`/projects/${projectId}/tasks`, payload);
  return data.task;
}

export async function updateTask(taskId: string, payload: Partial<TaskPayload>) {
  const { data } = await http.patch<{ task: Task }>(`/tasks/${taskId}`, payload);
  return data.task;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const { data } = await http.patch<{ task: Task }>(`/tasks/${taskId}/status`, { status });
  return data.task;
}

export async function deleteTask(taskId: string) {
  await http.delete(`/tasks/${taskId}`);
}
