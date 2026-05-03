import type { Prisma, Role, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { addDays, startOfToday } from "../utils/format.js";
import { ApiError } from "../utils/api-error.js";
import { serializeTask, taskDetailInclude } from "../utils/serializers.js";

type CurrentUser = {
  id: string;
  role: Role;
  name: string;
};

type TaskInput = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
};

type TaskQuery = {
  projectId?: string;
  assignedToMe?: string;
};

function buildTaskScope(user: CurrentUser, taskId?: string): Prisma.TaskWhereInput {
  const base = taskId ? { id: taskId } : {};

  if (user.role === "ADMIN") {
    return base;
  }

  return {
    ...base,
    project: {
      members: {
        some: {
          userId: user.id
        }
      }
    }
  };
}

function parseDueDate(value?: string | null) {
  return value ? new Date(value) : null;
}

async function ensureProjectMembership(projectId: string, userId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  if (!membership) {
    throw new ApiError(400, "Assignee must be a member of the project");
  }
}

export async function listTasks(user: CurrentUser, query: TaskQuery) {
  const where: Prisma.TaskWhereInput = buildTaskScope(user);

  if (query.projectId) {
    where.projectId = query.projectId;
  }

  if (query.assignedToMe === "true") {
    where.assigneeId = user.id;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskDetailInclude,
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
  });

  return tasks.map(serializeTask);
}

export async function getTaskById(user: CurrentUser, taskId: string) {
  const task = await prisma.task.findFirst({
    where: buildTaskScope(user, taskId),
    include: taskDetailInclude
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return serializeTask(task);
}

export async function createTask(user: CurrentUser, projectId: string, input: Required<Pick<TaskInput, "title">> & TaskInput) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (input.assigneeId) {
    await ensureProjectMembership(projectId, input.assigneeId);
  }

  const task = await prisma.$transaction(async (tx) => {
    const createdTask = await tx.task.create({
      data: {
        projectId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        priority: input.priority ?? "MEDIUM",
        status: input.status ?? "TODO",
        dueDate: parseDueDate(input.dueDate),
        assigneeId: input.assigneeId || null,
        createdById: user.id,
        updatedById: user.id
      }
    });

    await tx.taskActivity.create({
      data: {
        taskId: createdTask.id,
        actorId: user.id,
        type: "TASK_CREATED",
        message: `Created task "${createdTask.title}".`
      }
    });

    return tx.task.findUniqueOrThrow({
      where: { id: createdTask.id },
      include: taskDetailInclude
    });
  });

  return serializeTask(task);
}

export async function updateTask(user: CurrentUser, taskId: string, input: TaskInput) {
  const existingTask = await prisma.task.findFirst({
    where: buildTaskScope(user, taskId)
  });

  if (!existingTask) {
    throw new ApiError(404, "Task not found");
  }

  if (user.role !== "ADMIN") {
    const allowedKeys = Object.keys(input);
    const invalidMutation =
      allowedKeys.some((key) => key !== "status") || input.status === undefined || existingTask.assigneeId !== user.id;

    if (invalidMutation) {
      throw new ApiError(403, "You can only update the status of tasks assigned to you");
    }

    return updateTaskStatus(user, taskId, input.status!);
  }

  if (input.assigneeId) {
    await ensureProjectMembership(existingTask.projectId, input.assigneeId);
  }

  const nextDueDate = input.dueDate === undefined ? existingTask.dueDate : parseDueDate(input.dueDate);
  const nextAssigneeId = input.assigneeId === undefined ? existingTask.assigneeId : input.assigneeId || null;
  const nextStatus = input.status ?? existingTask.status;
  const nextPriority = input.priority ?? existingTask.priority;
  const nextTitle = input.title?.trim() ?? existingTask.title;
  const nextDescription =
    input.description === undefined ? existingTask.description : input.description?.trim() || null;

  const task = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        title: nextTitle,
        description: nextDescription,
        status: nextStatus,
        priority: nextPriority,
        dueDate: nextDueDate,
        assigneeId: nextAssigneeId,
        updatedById: user.id
      }
    });

    await tx.taskActivity.create({
      data: {
        taskId,
        actorId: user.id,
        type: "TASK_UPDATED",
        message: `Updated task "${updatedTask.title}".`
      }
    });

    return tx.task.findUniqueOrThrow({
      where: { id: taskId },
      include: taskDetailInclude
    });
  });

  return serializeTask(task);
}

export async function updateTaskStatus(user: CurrentUser, taskId: string, status: TaskStatus) {
  const task = await prisma.task.findFirst({
    where: buildTaskScope(user, taskId)
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (user.role !== "ADMIN" && task.assigneeId !== user.id) {
    throw new ApiError(403, "You can only update the status of tasks assigned to you");
  }

  const updatedTask = await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        status,
        updatedById: user.id
      }
    });

    await tx.taskActivity.create({
      data: {
        taskId,
        actorId: user.id,
        type: "STATUS_CHANGED",
        message: `${user.name} changed the task status to ${status.replace("_", " ")}.`
      }
    });

    return tx.task.findUniqueOrThrow({
      where: { id: taskId },
      include: taskDetailInclude
    });
  });

  return serializeTask(updatedTask);
}

export async function deleteTask(_user: CurrentUser, taskId: string) {
  const existingTask = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!existingTask) {
    throw new ApiError(404, "Task not found");
  }

  await prisma.task.delete({
    where: { id: taskId }
  });
}

export async function getRecentActivity(user: CurrentUser) {
  const where: Prisma.TaskActivityWhereInput =
    user.role === "ADMIN"
      ? {}
      : {
          task: {
            project: {
              members: {
                some: {
                  userId: user.id
                }
              }
            }
          }
        };

  return prisma.taskActivity.findMany({
    where,
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      task: {
        select: {
          id: true,
          title: true,
          project: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }
    }
  });
}

export async function getTaskMetrics(user: CurrentUser) {
  const taskWhere = buildTaskScope(user);
  const totalTasks = await prisma.task.count({ where: taskWhere });
  const allScopedTasks = await prisma.task.findMany({
    where: taskWhere,
    select: {
      id: true,
      status: true,
      dueDate: true,
      assigneeId: true
    }
  });

  const today = startOfToday();
  const dueSoonDate = addDays(today, 7);
  const tasksByStatus = allScopedTasks.reduce<Record<string, number>>((accumulator, task) => {
    accumulator[task.status] = (accumulator[task.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    totalTasks,
    tasksByStatus,
    overdueTasks: allScopedTasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== "DONE")
      .length,
    dueSoonTasks: allScopedTasks.filter(
      (task) => task.dueDate && task.dueDate >= today && task.dueDate <= dueSoonDate && task.status !== "DONE"
    ).length,
    assignedToMe: allScopedTasks.filter((task) => task.assigneeId === user.id).length
  };
}
