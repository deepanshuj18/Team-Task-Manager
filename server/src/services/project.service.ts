import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { projectDetailInclude, projectListInclude, publicUserSelect, serializeProject } from "../utils/serializers.js";

type CurrentUser = {
  id: string;
  role: Role;
};

type ProjectInput = {
  title: string;
  description?: string | null;
};

function buildProjectScope(user: CurrentUser, projectId?: string): Prisma.ProjectWhereInput {
  const base = projectId ? { id: projectId } : {};

  if (user.role === "ADMIN") {
    return base;
  }

  return {
    ...base,
    members: {
      some: {
        userId: user.id
      }
    }
  };
}

export async function listProjects(user: CurrentUser) {
  const projects = await prisma.project.findMany({
    where: buildProjectScope(user),
    include: projectListInclude,
    orderBy: {
      updatedAt: "desc"
    }
  });

  return projects.map(serializeProject);
}

export async function getProjectById(user: CurrentUser, projectId: string) {
  const project = await prisma.project.findFirst({
    where: buildProjectScope(user, projectId),
    include: projectDetailInclude
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return serializeProject(project);
}

export async function createProject(user: CurrentUser, input: ProjectInput) {
  const title = input.title.trim();
  const description = input.description?.trim() || null;

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.project.create({
      data: {
        title,
        description,
        ownerId: user.id
      }
    });

    await tx.projectMember.create({
      data: {
        projectId: createdProject.id,
        userId: user.id,
        addedById: user.id
      }
    });

    return tx.project.findUniqueOrThrow({
      where: { id: createdProject.id },
      include: projectDetailInclude
    });
  });

  return serializeProject(project);
}

export async function updateProject(_user: CurrentUser, projectId: string, input: ProjectInput) {
  const existingProject = await prisma.project.findUnique({ where: { id: projectId } });

  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null
    },
    include: projectDetailInclude
  });

  return serializeProject(project);
}

export async function deleteProject(_user: CurrentUser, projectId: string) {
  const existingProject = await prisma.project.findUnique({ where: { id: projectId } });

  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  await prisma.project.delete({
    where: { id: projectId }
  });
}

export async function addProjectMember(adminUser: CurrentUser, projectId: string, userId: string) {
  const [project, userToAdd] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect })
  ]);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!userToAdd) {
    throw new ApiError(404, "User not found");
  }

  const existingMembership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  if (existingMembership) {
    throw new ApiError(409, "User is already a project member");
  }

  const projectWithMembers = await prisma.$transaction(async (tx) => {
    await tx.projectMember.create({
      data: {
        projectId,
        userId,
        addedById: adminUser.id
      }
    });

    return tx.project.findUniqueOrThrow({
      where: { id: projectId },
      include: projectDetailInclude
    });
  });

  return serializeProject(projectWithMembers);
}

export async function removeProjectMember(adminUser: CurrentUser, projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.ownerId === userId) {
    throw new ApiError(400, "Project owner cannot be removed from the team");
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId
      }
    }
  });

  if (!membership) {
    throw new ApiError(404, "Project member not found");
  }

  const updatedProject = await prisma.$transaction(async (tx) => {
    await tx.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    });

    await tx.task.updateMany({
      where: {
        projectId,
        assigneeId: userId
      },
      data: {
        assigneeId: null,
        updatedById: adminUser.id
      }
    });

    return tx.project.findUniqueOrThrow({
      where: { id: projectId },
      include: projectDetailInclude
    });
  });

  return serializeProject(updatedProject);
}