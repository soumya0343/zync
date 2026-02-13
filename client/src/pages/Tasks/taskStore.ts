// Global task store — every task/subtask lives here, keyed by ID.
// Each task knows its parent and its children. This enables infinite nesting.
// Top-level tasks link to a parent goal via goalId.

export interface TaskNode {
  id: string;
  title: string;
  status: "backlog" | "planned" | "in-progress" | "blocked" | "done" | "todo"; // unified
  description?: string;
  bullets?: string[];
  breadcrumb: string[]; // e.g. ['PROJECTS', 'SEMESTER 1']
  tag?: string; // e.g. 'ECON-101'
  assignee?: string;
  dueDate?: string;
  priority?: string;
  project?: string;
  created?: string;
  statusColor?: string;
  flagColor?: string;
  parentId?: string | null;
  childIds: string[];
  goalId?: string; // which goal this top-level task belongs to
}

// Mutable store (simulating a database)
const taskStore: Record<string, TaskNode> = {};

// Seed data ─────────────────────────────────────────────────

function seed() {
  // ── Top-level tasks (from Kanban board) ─────────────────
  add({
    id: "kt-1",
    title: "Renew Library Books",
    status: "todo",
    description:
      "Return overdue library books and renew the ones still needed.",
    breadcrumb: ["PROJECTS", "SEMESTER 1"],
    tag: "CAMPUS",
    assignee: "Me (Alex)",
    dueDate: "Oct 24, 2023",
    priority: "Low",
    project: "Campus Life",
    created: "Oct 18, 2023",
    statusColor: "#6b7280",
    parentId: null,
    childIds: [],
    goalId: "g-2",
  });

  add({
    id: "kt-2",
    title: "Buy groceries for the week",
    status: "todo",
    description: "Weekly grocery run. Check pantry first.",
    breadcrumb: ["PERSONAL"],
    tag: "LIFE",
    assignee: "Me (Alex)",
    priority: "Low",
    project: "Personal",
    created: "Oct 19, 2023",
    statusColor: "#6b7280",
    parentId: null,
    childIds: [],
    goalId: "g-3",
  });

  add({
    id: "kt-3",
    title: "Study for Calculus Midterm",
    status: "todo",
    description:
      "Cover chapters 5-8. Focus on integration techniques and series convergence.",
    bullets: [
      "Review practice problems from recitation",
      "Re-watch lecture 12 on Taylor series",
    ],
    breadcrumb: ["PROJECTS", "SEMESTER 1"],
    tag: "MATH-201",
    assignee: "Me (Alex)",
    dueDate: "Tomorrow",
    priority: "High",
    project: "Mathematics 201",
    created: "Oct 15, 2023",
    statusColor: "#f59e0b",
    parentId: null,
    childIds: ["kt-3-1", "kt-3-2"],
    goalId: "g-1",
  });

  add({
    id: "kt-3-1",
    title: "Complete practice problem set 5",
    status: "in-progress",
    description: "Work through all 20 problems. Focus on sections 5.3 and 5.4.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "MATH-201"],
    tag: "PRACTICE",
    assignee: "Me (Alex)",
    dueDate: "Tonight",
    priority: "High",
    project: "Mathematics 201",
    created: "Oct 20, 2023",
    statusColor: "#f59e0b",
    parentId: "kt-3",
    childIds: [],
  });

  add({
    id: "kt-3-2",
    title: "Make formula cheat sheet",
    status: "todo",
    description: "Compile all key formulas for the exam.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "MATH-201"],
    tag: "STUDY",
    assignee: "Me (Alex)",
    priority: "Medium",
    project: "Mathematics 201",
    created: "Oct 20, 2023",
    statusColor: "#6b7280",
    parentId: "kt-3",
    childIds: [],
  });

  // ── Draft History Essay (the main one with deep subtasks) ──
  add({
    id: "kt-4",
    title: "Draft Introduction for Economics Thesis",
    status: "in-progress",
    description:
      "Focus on the thesis statement and the three main arguments. Don't worry about citations yet, just get the flow right.",
    bullets: [
      "Review macro-econ notes from Week 4",
      "Check Professor's feedback on the outline",
    ],
    breadcrumb: ["PROJECTS", "SEMESTER 1"],
    tag: "ECON-101",
    assignee: "Me (Alex)",
    dueDate: "Oct 24, 2023",
    priority: "High",
    project: "Economics 101",
    created: "Oct 20, 2023",
    statusColor: "#f59e0b",
    parentId: null,
    childIds: ["st-1", "st-2", "st-3"],
    goalId: "g-2",
  });

  add({
    id: "st-1",
    title: "Find 3 key sources on Keynesian theory",
    status: "done",
    description:
      "Search JSTOR and Google Scholar for peer-reviewed papers on Keynesian economics post-2008.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101"],
    tag: "RESEARCH",
    assignee: "Me (Alex)",
    priority: "Medium",
    project: "Economics 101",
    created: "Oct 20, 2023",
    statusColor: "#16a34a",
    parentId: "kt-4",
    childIds: ["st-1-1", "st-1-2"],
  });

  add({
    id: "st-1-1",
    title: 'Search JSTOR for "Keynesian fiscal policy"',
    status: "done",
    description:
      "Use advanced search filters. Target papers published 2010-2023.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101", "RESEARCH"],
    assignee: "Me (Alex)",
    project: "Economics 101",
    created: "Oct 20, 2023",
    statusColor: "#16a34a",
    parentId: "st-1",
    childIds: [],
  });

  add({
    id: "st-1-2",
    title: "Read and annotate Krugman (2012) paper",
    status: "done",
    description:
      "Focus on chapters 3 and 4 regarding liquidity trap arguments.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101", "RESEARCH"],
    assignee: "Me (Alex)",
    project: "Economics 101",
    created: "Oct 21, 2023",
    statusColor: "#16a34a",
    parentId: "st-1",
    childIds: [],
  });

  add({
    id: "st-2",
    title: "Write opening hook and definition of scope",
    status: "in-progress",
    description:
      "Start with a compelling opening paragraph that frames the economic question. Define what the thesis will and will not cover.",
    bullets: [
      "Draft 2-3 potential opening sentences",
      "Define scope: post-2008 fiscal policy only",
    ],
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101"],
    tag: "WRITING",
    assignee: "Me (Alex)",
    dueDate: "Oct 23, 2023",
    priority: "High",
    project: "Economics 101",
    created: "Oct 20, 2023",
    statusColor: "#f59e0b",
    flagColor: "#f59e0b",
    parentId: "kt-4",
    childIds: ["st-2-1", "st-2-2"],
  });

  add({
    id: "st-2-1",
    title: "Draft 3 opening sentence options",
    status: "in-progress",
    description:
      "Try different angles: statistics-led, question-led, anecdote-led.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101", "WRITING"],
    assignee: "Me (Alex)",
    project: "Economics 101",
    created: "Oct 21, 2023",
    statusColor: "#f59e0b",
    parentId: "st-2",
    childIds: [],
  });

  add({
    id: "st-2-2",
    title: "Write scope definition paragraph",
    status: "todo",
    description: "Clearly state the boundaries of the research.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101", "WRITING"],
    assignee: "Me (Alex)",
    project: "Economics 101",
    created: "Oct 21, 2023",
    statusColor: "#6b7280",
    parentId: "st-2",
    childIds: [],
  });

  add({
    id: "st-3",
    title: "Draft core thesis statement",
    status: "todo",
    description:
      "Write a single, clear thesis statement that can be supported by three arguments.",
    breadcrumb: ["PROJECTS", "SEMESTER 1", "ECON-101"],
    tag: "WRITING",
    assignee: "Me (Alex)",
    dueDate: "Oct 24, 2023",
    priority: "Critical",
    project: "Economics 101",
    created: "Oct 20, 2023",
    statusColor: "#ef4444",
    flagColor: "#ef4444",
    parentId: "kt-4",
    childIds: [],
  });

  // ── kt-5: Write Lab Report ──
  add({
    id: "kt-5",
    title: "Write Lab Report",
    status: "todo",
    description: "Write up the lab report for Chemistry experiment #4.",
    breadcrumb: ["PROJECTS", "SEMESTER 1"],
    tag: "CHEM-101",
    assignee: "Me (Alex)",
    dueDate: "Nov 1, 2023",
    priority: "Medium",
    project: "Chemistry 101",
    created: "Oct 22, 2023",
    statusColor: "#6b7280",
    parentId: null,
    childIds: [],
    goalId: "g-2",
  });

  // ── kt-6 through kt-8 ──
  add({
    id: "kt-6",
    title: "Submit Financial Aid Form",
    status: "todo",
    description: "Complete and submit the FAFSA renewal before the deadline.",
    breadcrumb: ["PERSONAL"],
    tag: "ADMIN",
    assignee: "Me (Alex)",
    dueDate: "Due Today 11pm",
    priority: "Critical",
    project: "Personal",
    created: "Oct 19, 2023",
    statusColor: "#ef4444",
    parentId: null,
    childIds: [],
    goalId: "g-2",
  });

  add({
    id: "kt-7",
    title: "Prepare Presentation Slides",
    status: "in-progress",
    description: "Create slide deck for the group economics presentation.",
    breadcrumb: ["PROJECTS", "SEMESTER 1"],
    tag: "ECON-101",
    assignee: "Me (Alex)",
    dueDate: "Oct 26, 2023",
    priority: "High",
    project: "Economics 101",
    created: "Oct 21, 2023",
    statusColor: "#f59e0b",
    parentId: null,
    childIds: [],
    goalId: "g-1",
  });

  add({
    id: "kt-8",
    title: "Clean apartment",
    status: "todo",
    description: "General cleaning, laundry, dishes.",
    breadcrumb: ["PERSONAL"],
    tag: "LIFE",
    assignee: "Me (Alex)",
    dueDate: "This weekend",
    priority: "Low",
    project: "Personal",
    created: "Oct 22, 2023",
    statusColor: "#6b7280",
    parentId: null,
    childIds: [],
    goalId: "g-3",
  });
}

// ── Store helpers ─────────────────────────────────────────

export function add(node: TaskNode) {
  taskStore[node.id] = node;
}

export function getTask(id: string): TaskNode | undefined {
  return taskStore[id];
}

export function getChildren(id: string): TaskNode[] {
  const parent = taskStore[id];
  if (!parent) return [];
  return parent.childIds.map((cid) => taskStore[cid]).filter(Boolean);
}

export function addChild(parentId: string, title: string): TaskNode | null {
  const parent = taskStore[parentId];
  if (!parent) return null;
  const newId = `${parentId}-${Date.now()}`;
  const child: TaskNode = {
    id: newId,
    title,
    status: "todo",
    breadcrumb: [...parent.breadcrumb, ...(parent.tag ? [parent.tag] : [])],
    assignee: parent.assignee,
    project: parent.project,
    created: "Just now",
    statusColor: "#6b7280",
    parentId,
    childIds: [],
  };
  taskStore[newId] = child;
  parent.childIds.push(newId);
  return child;
}

import { KANBAN_TASKS, KANBAN_COLUMNS } from "./mockData";

export function updateTaskStatus(id: string, status: TaskNode["status"]) {
  const task = taskStore[id];
  if (!task) return;

  const oldStatus = task.status;
  task.status = status;

  const colors: Record<string, string> = {
    backlog: "#6b7280",
    todo: "#6b7280",
    planned: "#f59e0b",
    "in-progress": "#8b5cf6",
    blocked: "#ef4444",
    done: "#16a34a",
  };

  if (colors[status]) {
    task.statusColor = colors[status];
  }

  // Sync with Kanban Board Data
  const kanbanTask = KANBAN_TASKS.find((t) => t.id === id);
  if (kanbanTask) {
    // Map TaskNode status to KanbanStatus if needed (they are now unified types mostly)
    kanbanTask.kanbanStatus = status as any;

    // Move between columns
    // 1. Remove from old column
    const oldColId = oldStatus === "todo" ? "backlog" : oldStatus; // map todo -> backlog for kanban
    const oldCol =
      KANBAN_COLUMNS.find((c) => c.id === oldColId) ||
      KANBAN_COLUMNS.find((c) => c.tasks.some((t) => t.id === id));

    if (oldCol) {
      oldCol.tasks = oldCol.tasks.filter((t) => t.id !== id);
      oldCol.count = oldCol.tasks.length;
    }

    // 2. Add to new column
    const newColId = status === "todo" ? "backlog" : status;
    const newCol = KANBAN_COLUMNS.find((c) => c.id === newColId);
    if (newCol) {
      // Check if already there to avoid dupes (though we filtered above)
      if (!newCol.tasks.find((t) => t.id === id)) {
        newCol.tasks = [...newCol.tasks, kanbanTask];
        newCol.count = newCol.tasks.length;
      }
    }
  }
}

export function cycleTaskStatus(id: string): TaskNode | null {
  const task = taskStore[id];
  if (!task) return null;
  // Cycle main statuses
  const order: TaskNode["status"][] = ["todo", "in-progress", "done"];
  // If current status is not in cycle (e.g. blocked), reset to todo
  let nextIdx = order.indexOf(task.status);
  if (nextIdx === -1) nextIdx = -1; // defaults to 0 next

  const nextStatus = order[(nextIdx + 1) % order.length];
  updateTaskStatus(id, nextStatus);
  return task;
}

// Walk up the parent chain to find the root (top-level) task
export function getTopLevelTaskId(taskId: string): string {
  let current = taskStore[taskId];
  while (current?.parentId) {
    current = taskStore[current.parentId];
  }
  return current?.id || taskId;
}

// Initialize
seed();
