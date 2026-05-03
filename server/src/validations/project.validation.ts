import { z } from "zod";

export const projectParamsSchema = z.object({
  projectId: z.string().min(1, "Project id is required")
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Project title is required"),
  description: z.string().trim().optional().nullable()
});

export const updateProjectSchema = createProjectSchema;

export const projectMemberSchema = z.object({
  userId: z.string().min(1, "User id is required")
});

export const projectMemberParamsSchema = z.object({
  projectId: z.string().min(1, "Project id is required"),
  userId: z.string().min(1, "User id is required")
});