import type { Goal } from "../../../types";
import "./DashboardComponents.css";

interface GoalCardProps {
  goal: Goal;
}

const GoalCard = ({ goal }: GoalCardProps) => {
  // Determine display values based on goal
  const isBookGoal = goal.title.includes("Book");

  const iconBg = isBookGoal ? "#1a1a1a" : "#2ecc71";
  const iconEmoji = isBookGoal ? "📖" : "🎬";
  const timeTag = isBookGoal ? "Q4" : "MONTHLY";

  const showDaysLeft = !isBookGoal;

  // Progress display
  const progressDisplay = isBookGoal ? (
    <>
      <strong>4</strong>/12
    </>
  ) : (
    <>
      <strong>$350</strong>/$500
    </>
  );

  const progressBarColor = goal.status === "on-track" ? "#1a1a1a" : "#2ecc71";

  return (
    <div className="goal-card">
      <div className="goal-header">
        <div className="goal-icon-box" style={{ background: iconBg }}>
          <span>{iconEmoji}</span>
        </div>
        <div className="goal-meta">
          {showDaysLeft && <span className="goal-days-left">3 days left</span>}
          <span className="goal-tag">{timeTag}</span>
        </div>
      </div>
      <div className="goal-content">
        <h3>{goal.title}</h3>
        <p>{goal.description}</p>
      </div>
      <div className="goal-footer">
        <div className="goal-progress">
          <span className="progress-text">{progressDisplay}</span>
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
          {goal.status === "on-track" ? "On Track" : goal.status}
        </span>
      </div>
    </div>
  );
};

export default GoalCard;
