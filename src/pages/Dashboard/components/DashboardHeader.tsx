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
        <button className="btn-checkin">✏️ Daily Check-in</button>
      </div>
    </div>
  );
};

export default DashboardHeader;
