import { Router } from "express";
import * as projectController from "../controllers/project.controller.js";
import * as taskController from "../controllers/task.controller.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createProjectSchema,
  projectMemberParamsSchema,
  projectMemberSchema,
  projectParamsSchema,
  updateProjectSchema
} from "../validations/project.validation.js";
import { createTaskSchema, projectTaskParamsSchema } from "../validations/task.validation.js";

export const projectRouter = Router();

projectRouter.get("/", asyncHandler(projectController.listProjects));
projectRouter.post(
  "/",
  authorize("ADMIN"),
  validate({ body: createProjectSchema }),
  asyncHandler(projectController.createProject)
);
projectRouter.get(
  "/:projectId",
  validate({ params: projectParamsSchema }),
  asyncHandler(projectController.getProject)
);
projectRouter.patch(
  "/:projectId",
  authorize("ADMIN"),
  validate({ params: projectParamsSchema, body: updateProjectSchema }),
  asyncHandler(projectController.updateProject)
);
projectRouter.delete(
  "/:projectId",
  authorize("ADMIN"),
  validate({ params: projectParamsSchema }),
  asyncHandler(projectController.deleteProject)
);
projectRouter.post(
  "/:projectId/members",
  authorize("ADMIN"),
  validate({ params: projectParamsSchema, body: projectMemberSchema }),
  asyncHandler(projectController.addProjectMember)
);
projectRouter.delete(
  "/:projectId/members/:userId",
  authorize("ADMIN"),
  validate({ params: projectMemberParamsSchema }),
  asyncHandler(projectController.removeProjectMember)
);
projectRouter.post(
  "/:projectId/tasks",
  authorize("ADMIN"),
  validate({ params: projectTaskParamsSchema, body: createTaskSchema }),
  asyncHandler(taskController.createTask)
);