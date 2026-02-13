import "./DashboardComponents.css";

interface ProductivityChartProps {
  completedCount: number;
  trend: number; // percentage
}

const ProductivityChart = ({
  completedCount,
  trend,
}: ProductivityChartProps) => {
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
        {/* Simple CSS bar chart visualization */}
        <div className="bar" style={{ height: "40%" }}></div>
        <div className="bar" style={{ height: "60%" }}></div>
        <div className="bar" style={{ height: "50%" }}></div>
        <div className="bar active" style={{ height: "90%" }}></div>
        <div className="bar" style={{ height: "30%" }}></div>
        <div className="bar" style={{ height: "20%" }}></div>
        <div className="bar" style={{ height: "10%" }}></div>
      </div>

      <div className="trend-indicator">
        <span className="trend-arrow">↗</span>
        <span className="trend-value">{trend}% up</span>
        <span className="trend-context"> from last week</span>
      </div>
    </div>
  );
};

export default ProductivityChart;
