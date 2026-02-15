import "./DashboardComponents.css";

interface ProductivityChartProps {
  completedCount: number;
  trend: number; // percentage
  weeklyData: number[]; // Array of 7 days
}

const ProductivityChart = ({
  completedCount,
  trend,
  weeklyData,
}: ProductivityChartProps) => {
  // Find max value to determine bar height percentages
  const maxVal = Math.max(...weeklyData, 1); // Avoid division by zero

  return (
    <div className="widget-card productivity-widget">
      <div className="widget-header">
        <span className="widget-subtitle">PRODUCTIVITY</span>
      </div>
      <div className="productivity-stat">
        <h2>
          {completedCount} tasks <span className="stat-suffix">completed</span>
        </h2>
      </div>

      <div className="chart-placeholder">
        {weeklyData.map((val, index) => {
          const heightPercentage = Math.round((val / maxVal) * 100);
          // Highlight today (last bar)
          const isActive = index === 6;
          return (
            <div
              key={index}
              className={`bar ${isActive ? "active" : ""}`}
              style={{ height: `${heightPercentage}%`, minHeight: "4px" }}
              title={`${val} tasks`}
            ></div>
          );
        })}
      </div>

      <div className="trend-indicator">
        <span className="trend-arrow">{trend >= 0 ? "↗" : "↘"}</span>
        <span className="trend-value">
          {Math.abs(trend)}% {trend >= 0 ? "up" : "down"}
        </span>
        <span className="trend-context"> from last week</span>
      </div>
    </div>
  );
};

export default ProductivityChart;
