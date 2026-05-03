import { Router } from "express";
import * as taskController from "../controllers/task.controller.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  taskListQuerySchema,
  taskParamsSchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from "../validations/task.validation.js";

export const taskRouter = Router();

taskRouter.get("/", validate({ query: taskListQuerySchema }), asyncHandler(taskController.listTasks));
taskRouter.get("/:taskId", validate({ params: taskParamsSchema }), asyncHandler(taskController.getTask));
taskRouter.patch(
  "/:taskId",
  validate({ params: taskParamsSchema, body: updateTaskSchema }),
  asyncHandler(taskController.updateTask)
);
taskRouter.patch(
  "/:taskId/status",
  validate({ params: taskParamsSchema, body: updateTaskStatusSchema }),
  asyncHandler(taskController.updateTaskStatus)
);
taskRouter.delete(
  "/:taskId",
  authorize("ADMIN"),
  validate({ params: taskParamsSchema }),
  asyncHandler(taskController.deleteTask)
);
