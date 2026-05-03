import type { Request, Response } from "express";
import * as taskService from "../services/task.service.js";

export async function listTasks(request: Request, response: Response) {
  const tasks = await taskService.listTasks(request.user!, request.query);
  response.json({ tasks });
}

export async function getTask(request: Request, response: Response) {
  const taskId = String(request.params.taskId);
  const task = await taskService.getTaskById(request.user!, taskId);
  response.json({ task });
}

export async function createTask(request: Request, response: Response) {
  const projectId = String(request.params.projectId);
  const task = await taskService.createTask(request.user!, projectId, request.body);
  response.status(201).json({ task });
}

export async function updateTask(request: Request, response: Response) {
  const taskId = String(request.params.taskId);
  const task = await taskService.updateTask(request.user!, taskId, request.body);
  response.json({ task });
}

export async function updateTaskStatus(request: Request, response: Response) {
  const taskId = String(request.params.taskId);
  const task = await taskService.updateTaskStatus(request.user!, taskId, request.body.status);
  response.json({ task });
}

export async function deleteTask(request: Request, response: Response) {
  const taskId = String(request.params.taskId);
  await taskService.deleteTask(request.user!, taskId);
  response.status(204).send();
}
