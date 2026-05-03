import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { publicUserSelect } from "../utils/serializers.js";

type CurrentUser = {
  id: string;
  role: Role;
};

type UserListQuery = {
  search?: string;
  role?: Role;
  projectId?: string;
};

export async function listUsers(currentUser: CurrentUser, query: UserListQuery) {
  const filters: Prisma.UserWhereInput[] = [];

  if (query.search) {
    filters.push({
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } }
      ]
    });
  }

  if (query.role) {
    filters.push({ role: query.role });
  }

  if (query.projectId) {
    filters.push({
      memberships: {
        some: {
          projectId: query.projectId
        }
      }
    });
  }

  if (currentUser.role !== "ADMIN") {
    filters.push({
      OR: [
        {
          memberships: {
            some: {
              project: {
                members: {
                  some: {
                    userId: currentUser.id
                  }
                }
              }
            }
          }
        },
        { id: currentUser.id }
      ]
    });
  }

  return prisma.user.findMany({
    where: filters.length > 0 ? { AND: filters } : {},
    select: publicUserSelect,
    orderBy: { name: "asc" }
  });
}
