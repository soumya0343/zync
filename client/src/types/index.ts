// ─── Task Types ───────────────────────────────────────────────

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type KanbanStatus =
  | "backlog"
  | "planned"
  | "in-progress"
  | "blocked"
  | "done";
export type TaskCategory = "SCHOOL" | "LIFE" | "WORK";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  category: TaskCategory;
  kanbanStatus: KanbanStatus;
  numericPriority: number; // 0 = P0 (highest), 3 = P3 (lowest)
  dueDate?: string;
  dueDateLabel?: string; // e.g. "Oct 24", "Tomorrow", "Due Today 5pm"
  isUrgent?: boolean; // red date styling
  progressPercent?: number; // 0-100, only for in-progress
  progressColor?: string; // color of the progress bar
}

// ─── Goal Types ───────────────────────────────────────────────

export type GoalStatus = "not-started" | "on-track" | "at-risk" | "completed";

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number; // 0–100
  targetDate: string;
  category?: string;
  milestones: Milestone[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Daily Check-In Types ─────────────────────────────────────

export interface DailyCheckIn {
  id: string;
  date: string;
  mood: "great" | "good" | "okay" | "bad";
  accomplishments: string[];
  blockers: string[];
  plans: string[];
  notes?: string;
}
