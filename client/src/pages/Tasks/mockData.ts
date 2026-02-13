import type { KanbanTask, KanbanStatus } from "../../types";

export interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  count: number;
  color: string; // badge color
  tasks: KanbanTask[];
}

export const KANBAN_TASKS: KanbanTask[] = [
  {
    id: "kt-1",
    title: "Renew Library Books",
    category: "SCHOOL",
    kanbanStatus: "backlog",
    numericPriority: 3,
    dueDate: "2023-10-24",
    dueDateLabel: "Oct 24",
    isUrgent: false,
  },
  {
    id: "kt-2",
    title: "Buy groceries for the week",
    category: "LIFE",
    kanbanStatus: "backlog",
    numericPriority: 3,
    dueDateLabel: "No date",
    isUrgent: false,
  },
  {
    id: "kt-3",
    title: "Study for Calculus Midterm",
    category: "SCHOOL",
    kanbanStatus: "planned",
    numericPriority: 1,
    dueDateLabel: "Tomorrow",
    isUrgent: true,
  },
  {
    id: "kt-4",
    title: "Draft History Essay",
    category: "SCHOOL",
    kanbanStatus: "in-progress",
    numericPriority: 0,
    dueDateLabel: "Due Today 5pm",
    isUrgent: true,
    progressPercent: 60,
    progressColor: "#7c3aed",
  },
  {
    id: "kt-5",
    title: "Write Lab Report",
    category: "SCHOOL",
    kanbanStatus: "blocked",
    numericPriority: 2,
    dueDateLabel: "Nov 1",
    isUrgent: false,
  },
  {
    id: "kt-6",
    title: "Submit Financial Aid Form",
    category: "LIFE",
    kanbanStatus: "planned",
    numericPriority: 0,
    dueDateLabel: "Due Today 11pm",
    isUrgent: true,
  },
  {
    id: "kt-7",
    title: "Prepare Presentation Slides",
    category: "SCHOOL",
    kanbanStatus: "in-progress",
    numericPriority: 1,
    dueDateLabel: "Oct 26",
    isUrgent: false,
    progressPercent: 40,
    progressColor: "#f59e0b",
  },
  {
    id: "kt-8",
    title: "Clean apartment",
    category: "LIFE",
    kanbanStatus: "backlog",
    numericPriority: 2,
    dueDateLabel: "This weekend",
    isUrgent: false,
  },
];

export interface PriorityGroup {
  priority: number;
  label: string;
  color: string;
  bgColor: string;
  tasks: KanbanTask[];
}

export const PRIORITY_GROUPS: PriorityGroup[] = [
  {
    priority: 0,
    label: "P0 — Critical",
    color: "#ef4444",
    bgColor: "#fef2f2",
    tasks: KANBAN_TASKS.filter((t) => t.numericPriority === 0),
  },
  {
    priority: 1,
    label: "P1 — High",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    tasks: KANBAN_TASKS.filter((t) => t.numericPriority === 1),
  },
  {
    priority: 2,
    label: "P2 — Medium",
    color: "#6b7280",
    bgColor: "#f9fafb",
    tasks: KANBAN_TASKS.filter((t) => t.numericPriority === 2),
  },
  {
    priority: 3,
    label: "P3 — Low",
    color: "#adb5bd",
    bgColor: "#f9fafb",
    tasks: KANBAN_TASKS.filter((t) => t.numericPriority === 3),
  },
];

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "backlog",
    title: "Backlog",
    color: "#6b7280",
    count: KANBAN_TASKS.filter((t) => t.kanbanStatus === "backlog").length,
    tasks: KANBAN_TASKS.filter((t) => t.kanbanStatus === "backlog"),
  },
  {
    id: "planned",
    title: "Planned",
    color: "#f59e0b",
    count: KANBAN_TASKS.filter((t) => t.kanbanStatus === "planned").length,
    tasks: KANBAN_TASKS.filter((t) => t.kanbanStatus === "planned"),
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "#8b5cf6",
    count: KANBAN_TASKS.filter((t) => t.kanbanStatus === "in-progress").length,
    tasks: KANBAN_TASKS.filter((t) => t.kanbanStatus === "in-progress"),
  },
  {
    id: "blocked",
    title: "Blocked",
    color: "#ef4444",
    count: KANBAN_TASKS.filter((t) => t.kanbanStatus === "blocked").length,
    tasks: KANBAN_TASKS.filter((t) => t.kanbanStatus === "blocked"),
  },
];
