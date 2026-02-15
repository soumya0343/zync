import { useEffect, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import TodaysFocus from "./components/TodaysFocus";
import ActiveGoals from "./components/ActiveGoals";
import ProductivityChart from "./components/ProductivityChart";
import UpcomingEvents from "./components/UpcomingEvents";
import QuoteWidget from "./components/QuoteWidget";
import LoadingScreen from "../../components/common/LoadingScreen";
import "../../components/common/LoadingScreen.css";
import EmptyState from "../../components/common/EmptyState";
import {
  dashboardService,
  type DashboardData,
} from "../../services/dashboardService";
import "./Dashboard.css";

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading dashboard…" />;
  }

  if (error || !data) {
    return (
      <div className="loading-screen">
        <EmptyState
          icon="⚠️"
          title="Couldn’t load dashboard"
          description={error || "No data available. Try again in a moment."}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        {/* Left Main Column */}
        <div className="main-column">
          <DashboardHeader
            userName={data.userName}
            date={data.date}
            priorityTaskCount={data.priorityTaskCount}
          />

          <TodaysFocus tasks={data.todaysTasks} />

          <ActiveGoals goals={data.activeGoals} />
        </div>

        {/* Right Widget Column */}
        <div className="widget-column">
          <ProductivityChart
            completedCount={data.productivity.completedCount}
            trend={data.productivity.trend}
            weeklyData={data.productivity.weeklyData}
          />

          <UpcomingEvents events={data.events} />

          <QuoteWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
