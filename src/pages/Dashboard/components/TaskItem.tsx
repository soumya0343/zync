import type { Task } from "../../../types";
import "./DashboardComponents.css";

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <div className="task-item">
      <div className="task-checkbox">
        <input type="checkbox" id={`task-${task.id}`} />
        <label htmlFor={`task-${task.id}`}></label>
      </div>
      <div className="task-details">
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          {task.tags.map((tag) => (
            <span key={tag} className={`task-tag tag-${tag.toLowerCase()}`}>
              {tag}
            </span>
          ))}
          {task.dueDate && (
            <span className="task-time">
              🕒{" "}
              {new Date(task.dueDate).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
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
