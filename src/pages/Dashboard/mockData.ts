import type { Task, Goal } from "../../types";

export const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Finish Research Paper Draft",
    description: "",
    status: "todo",
    priority: "high",
    tags: ["University"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    dueDate: "2023-10-24T17:00:00Z", // 5:00 PM
  },
  {
    id: "2",
    title: "Gym Workout: Leg Day",
    description: "",
    status: "todo",
    priority: "medium", // Mapped to 'Health' visual style in component if needed, or use tags
    tags: ["Health"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: "1",
    title: "Read 12 Books",
    description: 'Reading "Atomic Habits"',
    status: "on-track",
    progress: 33, // 4/12 is roughly 33%
    targetDate: "2023-12-31T00:00:00Z",
    milestones: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Save $500",
    description: "Emergency fund",
    status: "at-risk", // Or just 'in-progress', let's stick to type
    progress: 70, // 350/500
    targetDate: "2023-10-27T00:00:00Z", // 3 days left
    milestones: [],
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_STATS = {
  tasksCompleted: 24,
  trend: 15, // 15% up
  weeklydata: [40, 60, 50, 90, 30, 20, 10], // Mock bar heights
};

export const MOCK_EVENTS = [
  {
    id: "1",
    title: "Design Systems",
    time: "2:00 PM",
    type: "Zoom",
    day: "24",
  },
  {
    id: "2",
    title: "Project Alpha Review",
    time: "10:00 AM",
    type: "Office",
    day: "25",
  },
  {
    id: "3",
    title: "Submit Final Report",
    time: "5:00 PM",
    type: "Deadline",
    day: "26",
  },
];
