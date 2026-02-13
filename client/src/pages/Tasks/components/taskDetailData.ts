export interface SubTask {
  id: string;
  title: string;
  status: "done" | "in-progress" | "todo";
  hasPriorityFlag?: boolean;
  flagColor?: string;
}

export interface TaskDetail {
  id: string;
  breadcrumb: string[];
  tag: string;
  title: string;
  status: string;
  statusColor: string;
  assignee: string;
  dueDate: string;
  priority: string;
  priorityIcon: string;
  description: string;
  bullets: string[];
  subtasks: SubTask[];
  subtaskProgress: number;
  activityLog: string;
}

export const MOCK_TASK_DETAIL: TaskDetail = {
  id: "kt-4",
  breadcrumb: ["PROJECTS", "SEMESTER 1"],
  tag: "ECON-101",
  title: "Draft Introduction for Economics Thesis",
  status: "In Progress",
  statusColor: "#f59e0b",
  assignee: "Me (Alex)",
  dueDate: "Oct 24, 2023",
  priority: "High",
  priorityIcon: "🚩",
  description:
    "Focus on the thesis statement and the three main arguments. Don't worry about citations yet, just get the flow right.",
  bullets: [
    "Review macro-econ notes from Week 4",
    "Check Professor's feedback on the outline",
  ],
  subtasks: [
    {
      id: "st-1",
      title: "Find 3 key sources on Keynesian theory",
      status: "done",
    },
    {
      id: "st-2",
      title: "Write opening hook and definition of scope",
      status: "in-progress",
      hasPriorityFlag: true,
      flagColor: "#f59e0b",
    },
    {
      id: "st-3",
      title: "Draft core thesis statement",
      status: "todo",
      hasPriorityFlag: true,
      flagColor: "#ef4444",
    },
  ],
  subtaskProgress: 33,
  activityLog: "YOU UPDATED THE STATUS • 2H AGO",
};
