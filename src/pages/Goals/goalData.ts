// Mutable goal store — mirrors taskStore pattern.
// Every task links back via goalId.

export type GoalCategory =
  | "short-term"
  | "long-term"
  | "financial"
  | "completed";

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  progress: number; // 0-100
  dueDate?: string;
  dueLabel?: string;
  dueSeverity?: "urgent" | "normal" | "done";
  taskIds: string[]; // IDs of tasks linked to this goal
}

export const CATEGORY_CONFIG: Record<
  GoalCategory,
  { label: string; bg: string; color: string }
> = {
  "short-term": { label: "Short-term", bg: "#fff4e5", color: "#e67e22" },
  "long-term": { label: "Long-term", bg: "#eef6ff", color: "#3b82f6" },
  financial: { label: "Financial", bg: "#fef2f2", color: "#ef4444" },
  completed: { label: "Completed", bg: "#f0fdf4", color: "#16a34a" },
};

const goalStore: Record<string, Goal> = {};

function addGoalInternal(goal: Goal) {
  goalStore[goal.id] = goal;
}

// ── Seed data ─────────────────────────────────────────────

function seed() {
  addGoalInternal({
    id: "g-1",
    title: "Master React Native",
    description:
      "Complete the advanced certification course and build a portfolio app.",
    category: "short-term",
    progress: 75,
    dueLabel: "Due in 3 days",
    dueSeverity: "urgent",
    taskIds: ["kt-3", "kt-7"],
  });

  addGoalInternal({
    id: "g-2",
    title: "Launch Personal Blog",
    description:
      "Design, develop, and write the first 5 articles for a personal tech blog.",
    category: "long-term",
    progress: 30,
    dueDate: "Nov 15, 2023",
    dueSeverity: "normal",
    taskIds: ["kt-4", "kt-5", "kt-1", "kt-6"],
  });

  addGoalInternal({
    id: "g-3",
    title: "Save for New Laptop",
    description: "Set aside $200 monthly to upgrade development workstation.",
    category: "financial",
    progress: 45,
    dueDate: "Dec 31, 2023",
    dueSeverity: "normal",
    taskIds: ["kt-8"],
  });

  addGoalInternal({
    id: "g-4",
    title: "Read 12 Books",
    description: "Read one book per month focusing on personal development.",
    category: "completed",
    progress: 100,
    dueLabel: "Done",
    dueSeverity: "done",
    taskIds: [],
  });
}

// ── Public API ────────────────────────────────────────────

export function getAllGoals(): Goal[] {
  return Object.values(goalStore);
}

export function getGoal(id: string): Goal | undefined {
  return goalStore[id];
}

export function getGoalForTask(taskId: string): Goal | undefined {
  return Object.values(goalStore).find((g) => g.taskIds.includes(taskId));
}

export function addGoal(
  title: string,
  description: string,
  category: GoalCategory,
  dueDate?: string,
): Goal {
  const id = `g-${Date.now()}`;
  const goal: Goal = {
    id,
    title,
    description,
    category,
    progress: 0,
    dueDate,
    dueSeverity: "normal",
    taskIds: [],
  };
  goalStore[id] = goal;
  return goal;
}

export function linkTaskToGoal(goalId: string, taskId: string) {
  const goal = goalStore[goalId];
  if (goal && !goal.taskIds.includes(taskId)) {
    goal.taskIds.push(taskId);
  }
}

// Initialize
seed();
