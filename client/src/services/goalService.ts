import api from "./api";
import type { Goal, GoalStatus } from "../types";

/** Raw goal shape from API (Prisma uses dueDate, no status/milestones). Export for use in dashboard etc. */
export interface ApiGoal {
  id: string;
  title: string;
  description?: string | null;
  category?: string;
  progress?: number;
  dueDate?: string | null;
  createdAt: string;
  tasks?: Array<{ id: string; column?: { title?: string } } | unknown>;
}

function isTaskDone(task: { column?: { title?: string } }): boolean {
  const title = task.column?.title?.toLowerCase() ?? "";
  return title === "done" || title.includes("complete");
}

/** Normalize API goal to frontend Goal. Progress = from linked tasks when available, else DB progress. */
export function normalizeGoal(g: ApiGoal, options?: { includeTasks?: boolean }): Goal {
  const dbProgress = typeof g.progress === "number" ? g.progress : 0;
  const tasks = Array.isArray(g.tasks) ? g.tasks : [];
  const withColumn = tasks.filter(
    (t): t is { id: string; column?: { title?: string } } =>
      t != null && typeof t === "object" && "column" in t,
  );
  const totalTasks = withColumn.length;
  const completedCount = totalTasks > 0 ? withColumn.filter((t) => isTaskDone(t)).length : 0;
  const progress =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : dbProgress;
  const status: GoalStatus =
    progress >= 100 ? "completed" : progress > 0 ? "on-track" : "not-started";

  const goal: Goal = {
    id: g.id,
    title: g.title,
    description: g.description ?? "",
    status,
    progress,
    targetDate: g.dueDate ? (typeof g.dueDate === "string" ? g.dueDate : new Date(g.dueDate).toISOString()) : "",
    category: g.category,
    milestones: [],
    createdAt: g.createdAt,
  };
  if (options?.includeTasks && Array.isArray(g.tasks)) {
    goal.tasks = g.tasks as Goal["tasks"];
  }
  return goal;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  category?: string;
  dueDate?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  category?: string;
  progress?: number;
  dueDate?: string;
  taskIds?: string[];
}

export const goalService = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get("/goals");
    const data = Array.isArray(response.data) ? response.data : [];
    return data.map((g: ApiGoal) => normalizeGoal(g, { includeTasks: true }));
  },

  getGoal: async (id: string): Promise<Goal> => {
    const response = await api.get(`/goals/${id}`);
    return normalizeGoal(response.data as ApiGoal, { includeTasks: true });
  },

  createGoal: async (data: CreateGoalDto) => {
    const response = await api.post("/goals", data);
    return response.data;
  },

  updateGoal: async (id: string, data: UpdateGoalDto) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  deleteGoal: async (id: string) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
};
