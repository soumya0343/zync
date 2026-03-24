import { useNavigate } from "react-router-dom";
import "./DashboardComponents.css";

interface DashboardHeaderProps {
  userName: string;
  date: string;
  priorityTaskCount: number;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const DashboardHeader = ({
  userName,
  date,
  priorityTaskCount,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const greeting = getGreeting();

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="date-display">
          <span className="calendar-icon">📅</span> {date}
        </div>
        <h1>{greeting}, {userName}</h1>
        <p className="subtitle">
          You have {priorityTaskCount} tasks due today.
        </p>
      </div>
      <div className="header-actions">
        <button className="btn-checkin" onClick={() => navigate("/check-in")}>
          📝 Daily Check-in
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
