import { useNavigate } from "react-router-dom";
import type { Goal } from "../../../types";
import GoalCard from "./GoalCard";
import EmptyState from "../../../components/common/EmptyState";
import "./DashboardComponents.css";

interface ActiveGoalsProps {
  goals: Goal[];
}

const ActiveGoals = ({ goals }: ActiveGoalsProps) => {
  const navigate = useNavigate();
  const isEmpty = !goals?.length;

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="section-title">
          <span className="icon-target">🎯</span> Active Goals
        </div>
      </div>
      {isEmpty ? (
        <EmptyState
          icon="🎯"
          title="No active goals"
          description="Create a goal to track progress."
          actionLabel="Go to goals"
          onAction={() => navigate("/goals")}
          compact
        />
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveGoals;
