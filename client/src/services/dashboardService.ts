import api from "./api";
import { normalizeGoal } from "./goalService";
import type { Task, Goal, TaskStatus } from "../types/index";

export interface DashboardData {
  userName: string;
  date: string;
  priorityTaskCount: number;
  todaysTasks: Task[];
  activeGoals: Goal[];
  productivity: {
    completedCount: number;
    weeklyData: number[];
    trend: number;
  };
  events: {
    id: string;
    title: string;
    time: string;
    type: string;
    day: string;
  }[];
}

// Helper to map column title to TaskStatus
const mapColumnToStatus = (columnTitle: string): TaskStatus => {
  const lower = columnTitle.toLowerCase();
  if (lower.includes("done") || lower.includes("complete")) return "done";
  if (lower.includes("progress")) return "in-progress";
  if (lower.includes("review")) return "in-review";
  return "todo";
};

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get("/dashboard");
    const data = response.data;

    // Map backend tasks to frontend Task interface
    const todaysTasks: Task[] = data.todaysTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      status: t.column ? mapColumnToStatus(t.column.title) : "todo",
      priority: t.priority,
      dueDate: t.dueDate,
      tags: [], // Backend doesn't support tags yet
      createdAt: t.createdAt,
      updatedAt: t.createdAt, // Fallback as backend lacks this field
    }));

    // Use same goal normalizer as goalService so goal shape is consistent everywhere
    const activeGoals: Goal[] = (data.activeGoals ?? []).map((g: Parameters<typeof normalizeGoal>[0]) =>
      normalizeGoal(g),
    );

    return {
      ...data,
      todaysTasks,
      activeGoals,
    };
  },
};
