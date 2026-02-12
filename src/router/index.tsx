import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import Tasks from "../pages/Tasks";
import TaskDetail from "../pages/Tasks/TaskDetail";
import Goals from "../pages/Goals";
import DailyCheckIn from "../pages/DailyCheckIn";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "tasks", element: <Tasks /> },
      { path: "tasks/:taskId", element: <TaskDetail /> },
      { path: "goals", element: <Goals /> },
      { path: "check-in", element: <DailyCheckIn /> },
    ],
  },
]);

export default router;
