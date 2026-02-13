import { useNavigate } from "react-router-dom";
import "./DashboardComponents.css";

interface DashboardHeaderProps {
  userName: string;
  date: string;
  priorityTaskCount: number;
}

const DashboardHeader = ({
  userName,
  date,
  priorityTaskCount,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="date-display">
          <span className="calendar-icon">📅</span> {date}
        </div>
        <h1>Good morning, {userName}</h1>
        <p className="subtitle">
          You have {priorityTaskCount} priority tasks today.
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
