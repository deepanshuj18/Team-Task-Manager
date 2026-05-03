import type { Request, Response } from "express";
import * as projectService from "../services/project.service.js";

export async function listProjects(request: Request, response: Response) {
  const projects = await projectService.listProjects(request.user!);
  response.json({ projects });
}

export async function getProject(request: Request, response: Response) {
  const projectId = String(request.params.projectId);
  const project = await projectService.getProjectById(request.user!, projectId);
  response.json({ project });
}

export async function createProject(request: Request, response: Response) {
  const project = await projectService.createProject(request.user!, request.body);
  response.status(201).json({ project });
}

export async function updateProject(request: Request, response: Response) {
  const projectId = String(request.params.projectId);
  const project = await projectService.updateProject(request.user!, projectId, request.body);
  response.json({ project });
}

export async function deleteProject(request: Request, response: Response) {
  const projectId = String(request.params.projectId);
  await projectService.deleteProject(request.user!, projectId);
  response.status(204).send();
}

export async function addProjectMember(request: Request, response: Response) {
  const projectId = String(request.params.projectId);
  const project = await projectService.addProjectMember(request.user!, projectId, request.body.userId);
  response.json({ project });
}

export async function removeProjectMember(request: Request, response: Response) {
  const projectId = String(request.params.projectId);
  const userId = String(request.params.userId);
  const project = await projectService.removeProjectMember(request.user!, projectId, userId);
  response.json({ project });
}
