// ─── Task Types ───────────────────────────────────────────────

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

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

// ─── Goal Types ───────────────────────────────────────────────

export type GoalStatus = "not-started" | "on-track" | "at-risk" | "completed";

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number; // 0–100
  targetDate: string;
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
