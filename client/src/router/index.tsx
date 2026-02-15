import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Tasks from "../pages/Tasks";
import TaskDetail from "../pages/Tasks/TaskDetail";
import Goals from "../pages/Goals";
import GoalDetail from "../pages/Goals/GoalDetail";
import DailyCheckIn from "../pages/DailyCheckIn";
import AuthLayout from "../pages/Auth/AuthLayout";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "tasks", element: <Tasks /> },
          { path: "tasks/:taskId", element: <TaskDetail /> },
          { path: "goals", element: <Goals /> },
          { path: "goals/:goalId", element: <GoalDetail /> },
          { path: "check-in", element: <DailyCheckIn /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
  { path: "*", element: <Navigate to="/" /> },
]);

export default router;
