import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./AppLayout.css";

const AppLayout = () => {
  const location = useLocation();
  const isTasksPage = location.pathname.startsWith("/tasks");
  const isGoalsPage = location.pathname.startsWith("/goals");
  const isCheckInPage = location.pathname.startsWith("/check-in");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">⚡</span>
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
              <p className="name">
                {isCheckInPage
                  ? "Alex Student"
                  : isTasksPage
                    ? "Sarah Student"
                    : isGoalsPage
                      ? "Alex Chen"
                      : "Alex M."}
              </p>
              <p className="plan">
                {isCheckInPage ? "alex@university.edu" : "Free Plan"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
