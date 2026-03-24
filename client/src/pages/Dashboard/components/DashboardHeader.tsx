import { useNavigate } from "react-router-dom";
import "./DashboardComponents.css";

interface DashboardHeaderProps {
  userName: string;
  priorityTaskCount: number;
}

const getGreeting = () => {
  const hour = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false });
  const h = parseInt(hour, 10);
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getTodayDate = () =>
  new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    month: "short",
    day: "numeric",
  });

const DashboardHeader = ({
  userName,
  priorityTaskCount,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const greeting = getGreeting();
  const todayDate = getTodayDate();

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="date-display">
          <span className="calendar-icon">📅</span> {todayDate}
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
