import type { Task } from "../../../types";
import "./DashboardComponents.css";

interface TaskItemProps {
  task: Task;
  onClick?: (taskId: string) => void;
}

const TaskItem = ({ task, onClick }: TaskItemProps) => {
  return (
    <div
      className="task-item"
      onClick={() => onClick?.(task.id)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div
        className="task-checkbox"
        onClick={(e) => e.stopPropagation()} // Prevent navigation when checking box
      >
        <input type="checkbox" id={`task-${task.id}`} />
        <label htmlFor={`task-${task.id}`}></label>
      </div>
      <div className="task-details">
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          {(task.tags || []).map((tag) => (
            <span key={tag} className={`task-tag tag-${tag.toLowerCase()}`}>
              {tag}
            </span>
          ))}
          {task.dueDate && (
            <span className="task-time">
              🕒{" "}
              {(() => {
                const date = new Date(task.dueDate);
                const today = new Date();
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();

                if (isToday) {
                  return "11:59 PM";
                }

                return date.toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                });
              })()}
            </span>
          )}
        </div>
      </div>
      <div className="task-actions">
        {task.priority === "high" && (
          <span className="priority-badge">High Priority</span>
        )}
        <button className="btn-more">•••</button>
      </div>
    </div>
  );
};

export default TaskItem;
