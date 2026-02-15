import type { Goal } from "../../../types";
import "./DashboardComponents.css";
import { Link } from "react-router-dom";

interface GoalCardProps {
  goal: Goal;
}

const getCategoryDetails = (category?: string) => {
  const normalized = category?.toLowerCase() || "";
  if (normalized.includes("health") || normalized.includes("fitness"))
    return { icon: "💪", bg: "#e74c3c" };
  if (normalized.includes("study") || normalized.includes("book"))
    return { icon: "📖", bg: "#3498db" };
  if (normalized.includes("finance") || normalized.includes("money"))
    return { icon: "💰", bg: "#f1c40f" };
  if (normalized.includes("work") || normalized.includes("career"))
    return { icon: "💼", bg: "#9b59b6" };
  return { icon: "🎯", bg: "#2ecc71" }; // Default
};

const GoalCard = ({ goal }: GoalCardProps) => {
  const { icon, bg } = getCategoryDetails(goal.category);

  // Calculate days left
  let daysLeftText = "";
  if (goal.targetDate) {
    const today = new Date();
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) daysLeftText = "Overdue";
    else if (diffDays === 0) daysLeftText = "Due today";
    else daysLeftText = `${diffDays} days left`;
  }

  const progressBarColor = goal.status === "completed" ? "#2ecc71" : "#1a1a1a";

  return (
    <Link to={`/goals/${goal.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div className="goal-card">
        <div className="goal-header">
          <div className="goal-icon-box" style={{ background: bg }}>
            <span>{icon}</span>
          </div>
          <div className="goal-meta">
            {daysLeftText && (
              <span className="goal-days-left">{daysLeftText}</span>
            )}
            <span className="goal-tag">{goal.category || "GOAL"}</span>
          </div>
        </div>
        <div className="goal-content">
          <h3>{goal.title}</h3>
          <p>{goal.description || "No description"}</p>
        </div>
        <div className="goal-footer">
          <div className="goal-progress">
            <span className="progress-text">
              <strong>{goal.progress}%</strong>
            </span>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${goal.progress}%`,
                  background: progressBarColor,
                }}
              ></div>
            </div>
          </div>
          <span className={`goal-status status-${goal.status}`}>
            {goal.status === "on-track"
              ? "On Track"
              : goal.status.replace("-", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GoalCard;
