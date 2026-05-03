import type { TaskPriority, TaskStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "../constants/index.js";
import { startOfToday } from "./format.js";

export const publicUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  role: true
});

export const projectListInclude = Prisma.validator<Prisma.ProjectInclude>()({
  owner: { select: publicUserSelect },
  _count: {
    select: {
      members: true,
      tasks: true
    }
  }
});

export const projectDetailInclude = Prisma.validator<Prisma.ProjectInclude>()({
  owner: { select: publicUserSelect },
  members: {
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: publicUserSelect }
    }
  },
  tasks: {
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    include: {
      assignee: { select: publicUserSelect },
      createdBy: { select: publicUserSelect },
      updatedBy: { select: publicUserSelect }
    }
  }
});

export const taskDetailInclude = Prisma.validator<Prisma.TaskInclude>()({
  assignee: { select: publicUserSelect },
  createdBy: { select: publicUserSelect },
  updatedBy: { select: publicUserSelect },
  project: {
    select: {
      id: true,
      title: true
    }
  },
  activities: {
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      actor: { select: publicUserSelect }
    }
  }
});

type SerializableTask = {
  dueDate: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  [key: string]: unknown;
};

function isOverdue(task: { dueDate: Date | null; status: TaskStatus }) {
  return Boolean(task.dueDate && task.dueDate < startOfToday() && task.status !== "DONE");
}

export function serializeTask<T extends SerializableTask>(task: T) {
  return {
    ...task,
    statusLabel: TASK_STATUS_LABELS[task.status],
    priorityLabel: TASK_PRIORITY_LABELS[task.priority],
    overdue: isOverdue(task)
  };
}

export function serializeProject(project: any) {
  return {
    ...project,
    memberCount: project.members ? project.members.length : project._count?.members ?? 0,
    taskCount: project.tasks ? project.tasks.length : project._count?.tasks ?? 0,
    tasks: project.tasks ? project.tasks.map(serializeTask) : undefined
  };
}

export function serializeTaskActivity(activity: any) {
  return {
    ...activity,
    task: activity.task
  };
}
