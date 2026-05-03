import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@teamtaskmanager.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
  const memberEmail = process.env.SEED_MEMBER_EMAIL ?? "member@teamtaskmanager.dev";
  const memberPassword = process.env.SEED_MEMBER_PASSWORD ?? "Member123!";

  const [adminHash, memberHash] = await Promise.all([
    bcrypt.hash(adminPassword, saltRounds),
    bcrypt.hash(memberPassword, saltRounds)
  ]);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "System Admin",
      role: "ADMIN",
      passwordHash: adminHash
    },
    create: {
      name: "System Admin",
      email: adminEmail,
      role: "ADMIN",
      passwordHash: adminHash
    }
  });

  const member = await prisma.user.upsert({
    where: { email: memberEmail },
    update: {
      name: "Core Member",
      role: "MEMBER",
      passwordHash: memberHash
    },
    create: {
      name: "Core Member",
      email: memberEmail,
      role: "MEMBER",
      passwordHash: memberHash
    }
  });

  const projectId = "seed-launch-project";

  const project = await prisma.project.upsert({
    where: { id: projectId },
    update: {
      title: "Product Launch",
      description: "Coordinate cross-functional work for the new product launch.",
      ownerId: admin.id
    },
    create: {
      id: projectId,
      title: "Product Launch",
      description: "Coordinate cross-functional work for the new product launch.",
      ownerId: admin.id
    }
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: admin.id
      }
    },
    update: {},
    create: {
      projectId: project.id,
      userId: admin.id,
      addedById: admin.id
    }
  });

  await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId: member.id
      }
    },
    update: {},
    create: {
      projectId: project.id,
      userId: member.id,
      addedById: admin.id
    }
  });

  const tasks = [
    {
      id: "seed-task-1",
      title: "Finalize launch checklist",
      description: "Document all launch blockers and secure approvals.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      assigneeId: member.id
    },
    {
      id: "seed-task-2",
      title: "Prepare onboarding email",
      description: "Draft and review customer onboarding communications.",
      status: "REVIEW",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      assigneeId: admin.id
    },
    {
      id: "seed-task-3",
      title: "QA release branch",
      description: "Run the final QA pass before release cutover.",
      status: "TODO",
      priority: "HIGH",
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
      assigneeId: member.id
    }
  ] as const;

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
        updatedById: admin.id
      },
      create: {
        ...task,
        projectId: project.id,
        createdById: admin.id,
        updatedById: admin.id
      }
    });
  }

  const seededTasks = await prisma.task.findMany({
    where: {
      id: {
        in: tasks.map((task) => task.id)
      }
    }
  });

  await prisma.taskActivity.deleteMany({
    where: {
      taskId: {
        in: seededTasks.map((task) => task.id)
      }
    }
  });

  for (const task of seededTasks) {
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        actorId: admin.id,
        type: "TASK_CREATED",
        message: `Seeded task "${task.title}".`
      }
    });
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
