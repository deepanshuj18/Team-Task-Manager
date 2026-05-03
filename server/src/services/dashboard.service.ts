import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { serializeTask } from "../utils/serializers.js";
import { getRecentActivity, getTaskMetrics } from "./task.service.js";

type CurrentUser = {
  id: string;
  role: Role;
  name: string;
};

export async function getDashboardSummary(user: CurrentUser) {
  const projectWhere =
    user.role === "ADMIN"
      ? {}
      : {
          members: {
            some: {
              userId: user.id
            }
          }
        };

  const [totalProjects, taskMetrics, recentActivity, myTasks] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    getTaskMetrics(user),
    getRecentActivity(user),
    prisma.task.findMany({
      where: {
        assigneeId: user.id,
        ...(user.role === "ADMIN"
          ? {}
          : {
              project: {
                members: {
                  some: {
                    userId: user.id
                  }
                }
              }
            })
      },
      take: 6,
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      include: {
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })
  ]);

  return {
    totalProjects,
    ...taskMetrics,
    myTasks: myTasks.map(serializeTask),
    recentActivity
  };
}
