import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import LoadingScreen from "../components/common/LoadingScreen";
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Tasks = lazy(() => import("../pages/Tasks"));
const TaskDetail = lazy(() => import("../pages/Tasks/TaskDetail"));
const Goals = lazy(() => import("../pages/Goals"));
const GoalDetail = lazy(() => import("../pages/Goals/GoalDetail"));
const DailyCheckIn = lazy(() => import("../pages/DailyCheckIn"));
const AuthLayout = lazy(() => import("../pages/Auth/AuthLayout"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Signup = lazy(() => import("../pages/Auth/Signup"));

const PageLoader = () => <LoadingScreen message="Loading…" />;

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><Dashboard /></Suspense> },
          { path: "tasks", element: <Suspense fallback={<PageLoader />}><Tasks /></Suspense> },
          { path: "tasks/:taskId", element: <Suspense fallback={<PageLoader />}><TaskDetail /></Suspense> },
          { path: "goals", element: <Suspense fallback={<PageLoader />}><Goals /></Suspense> },
          { path: "goals/:goalId", element: <Suspense fallback={<PageLoader />}><GoalDetail /></Suspense> },
          { path: "check-in", element: <Suspense fallback={<PageLoader />}><DailyCheckIn /></Suspense> },
        ],
      },
    ],
  },
  {
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
    ],
  },
  { path: "*", element: <Navigate to="/" /> },
]);

export default router;
