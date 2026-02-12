import DashboardHeader from "./components/DashboardHeader";
import TodaysFocus from "./components/TodaysFocus";
import ActiveGoals from "./components/ActiveGoals";
import ProductivityChart from "./components/ProductivityChart";
import UpcomingEvents from "./components/UpcomingEvents";
import QuoteWidget from "./components/QuoteWidget";
import { MOCK_TASKS, MOCK_GOALS, MOCK_STATS, MOCK_EVENTS } from "./mockData";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        {/* Left Main Column */}
        <div className="main-column">
          <DashboardHeader
            userName="Alex"
            date="Tuesday, Oct 24"
            priorityTaskCount={4}
          />

          <TodaysFocus tasks={MOCK_TASKS} />

          <ActiveGoals goals={MOCK_GOALS} />
        </div>

        {/* Right Widget Column */}
        <div className="widget-column">
          <ProductivityChart
            completedCount={MOCK_STATS.tasksCompleted}
            trend={MOCK_STATS.trend}
          />

          <UpcomingEvents events={MOCK_EVENTS} />

          <QuoteWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
