import { NavLink, Outlet } from "react-router-dom";
import "./AppLayout.css";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Zync</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Tasks
          </NavLink>
          <NavLink
            to="/goals"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Goals
          </NavLink>
          <NavLink
            to="/check-in"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Daily Check-In
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
