export type Role = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ProjectMember = {
  id: string;
  userId: string;
  projectId: string;
  createdAt: string;
  user: User;
};

export type Project = {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  owner: User;
  members?: ProjectMember[];
  tasks?: Task[];
  memberCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskActivity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  actor: User;
  task?: {
    id: string;
    title: string;
    project?: {
      id: string;
      title: string;
    };
  };
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  statusLabel: string;
  priority: TaskPriority;
  priorityLabel: string;
  dueDate: string | null;
  overdue: boolean;
  assigneeId: string | null;
  assignee?: User | null;
  createdBy?: User;
  updatedBy?: User | null;
  project?: {
    id: string;
    title: string;
  };
  activities?: TaskActivity[];
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  overdueTasks: number;
  dueSoonTasks: number;
  assignedToMe: number;
  myTasks: Task[];
  recentActivity: TaskActivity[];
};
