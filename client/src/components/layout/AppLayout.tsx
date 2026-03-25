import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Menu, X, LayoutDashboard, CheckSquare, Flag, PenLine } from "lucide-react";
import "./AppLayout.css";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isTasksPage = location.pathname.startsWith("/tasks");
  const isGoalsPage = location.pathname.startsWith("/goals");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <div className="mobile-topbar-logo">
          <img src="/logo.svg" alt="Zync Logo" className="logo-icon" />
          <h2>Zync</h2>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Sidebar backdrop on mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
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
            onClick={handleNavClick}
          >
            <LayoutDashboard size={18} />
            <span className="nav-label">Dashboard</span>
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={handleNavClick}
          >
            <CheckSquare size={18} />
            <span className="nav-label">Tasks</span>
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={handleNavClick}
          >
            <Flag size={18} />
            <span className="nav-label">Goals</span>
          </NavLink>
          <NavLink
            to="/check-in"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={handleNavClick}
          >
            <PenLine size={18} />
            <span className="nav-label">Daily Check-In</span>
          </NavLink>
        </nav>

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

      {/* Bottom navigation — mobile only */}
      <nav className="bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "bottom-nav-link active" : "bottom-nav-link"
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? "bottom-nav-link active" : "bottom-nav-link"
          }
        >
          <CheckSquare size={20} />
          <span>Tasks</span>
        </NavLink>
        <NavLink
          to="/goals"
          className={({ isActive }) =>
            isActive ? "bottom-nav-link active" : "bottom-nav-link"
          }
        >
          <Flag size={20} />
          <span>Goals</span>
        </NavLink>
        <NavLink
          to="/check-in"
          className={({ isActive }) =>
            isActive ? "bottom-nav-link active" : "bottom-nav-link"
          }
        >
          <PenLine size={20} />
          <span>Check-In</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppLayout;
