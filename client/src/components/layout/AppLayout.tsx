import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import "./AppLayout.css";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isTasksPage = location.pathname.startsWith("/tasks");
  const isGoalsPage = location.pathname.startsWith("/goals");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.svg" alt="Zync Logo" className="logo-icon" />
          <h2>Zync</h2>
        </div>

        {isTasksPage && (
          <div className="sidebar-new-task">
            <button
              className="btn-new-task"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-new-task"))
              }
            >
              + New Task
            </button>
          </div>
        )}

        {isGoalsPage && (
          <div className="sidebar-new-task">
            <button
              className="btn-new-task"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-new-goal"))
              }
            >
              + New Goal
            </button>
          </div>
        )}

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">▦</span> Dashboard
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">✓</span> Tasks
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">⚑</span> Goals
          </NavLink>
          <NavLink
            to="/check-in"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">✎</span> Daily Check-In
          </NavLink>
        </nav>

        <div className="sidebar-spaces">
          <h3>SPACES</h3>
          <ul>
            <li>
              <span className="dot"></span> University
            </li>
            <li>
              <span className="dot"></span> Internship
            </li>
            <li>
              <span className="dot"></span> Personal
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar"></div>
            <div className="user-info">
              <p className="name">{user?.name || "User"}</p>
              <p className="plan">{user?.email || "Free Plan"}</p>
            </div>
          </div>
          <button onClick={logout} className="btn-logout" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
