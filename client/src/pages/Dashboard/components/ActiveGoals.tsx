import type { Goal } from "../../../types";
import GoalCard from "./GoalCard";
import "./DashboardComponents.css";

interface ActiveGoalsProps {
  goals: Goal[];
}

const ActiveGoals = ({ goals }: ActiveGoalsProps) => {
  return (
    <div className="section-container">
      <div className="section-header">
        <div className="section-title">
          <span className="icon-target">🎯</span> Active Goals
        </div>
      </div>
      <div className="goals-grid">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

export default ActiveGoals;
