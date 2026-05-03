import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "../constants/index.js";

const taskBaseSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional().nullable(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().min(1).optional().nullable()
});

export const createTaskSchema = taskBaseSchema;

export const updateTaskSchema = taskBaseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided"
);

export const updateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUSES)
});

export const taskParamsSchema = z.object({
  taskId: z.string().min(1, "Task id is required")
});

export const projectTaskParamsSchema = z.object({
  projectId: z.string().min(1, "Project id is required")
});

export const taskListQuerySchema = z.object({
  projectId: z.string().optional(),
  assignedToMe: z.enum(["true", "false"]).optional()
});
