import { useNavigate } from "react-router-dom";
import type { Task } from "../../../types";
import TaskItem from "./TaskItem";
import "./DashboardComponents.css";

interface TodaysFocusProps {
  tasks: Task[];
}

const TodaysFocus = ({ tasks }: TodaysFocusProps) => {
  const navigate = useNavigate();

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="section-title">
          <span className="icon-sun">☀️</span> Today's Focus
        </div>
        <button className="btn-link" onClick={() => navigate("/tasks")}>
          View All Tasks
        </button>
      </div>
      <div className="tasks-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClick={(taskId) => navigate(`/tasks/${taskId}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default TodaysFocus;
