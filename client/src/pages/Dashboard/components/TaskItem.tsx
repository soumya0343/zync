import type { Task } from "../../../types";
import "./DashboardComponents.css";

interface TaskItemProps {
  task: Task;
  onClick?: (taskId: string) => void;
  /** When provided, checkbox is controlled and toggling calls this (stops propagation so parent Link is not triggered) */
  completed?: boolean;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  /** Optional status label (e.g. "Todo", "In Progress", "Done") to show as a tag */
  statusLabel?: string;
}

const TaskItem = ({ task, onClick, completed, onToggleComplete, statusLabel }: TaskItemProps) => {
  const isCompleted = completed ?? false;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(task.id, !isCompleted);
    }
  };

  return (
    <div
      className={`task-item${isCompleted ? " task-item--completed" : ""}`}
      onClick={() => onClick?.(task.id)}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="task-checkbox" onClick={handleCheckboxClick}>
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={onToggleComplete ? isCompleted : undefined}
          readOnly={!!onToggleComplete}
        />
        <label htmlFor={`task-${task.id}`}></label>
      </div>
      <div className="task-details">
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          {statusLabel != null && statusLabel !== "" && (
            <span className={`task-tag tag-status status-${statusLabel.toLowerCase().replace(/\s+/g, "-")}`}>
              {statusLabel}
            </span>
          )}
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
                const istFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
                const isToday = istFmt.format(date) === istFmt.format(new Date());

                if (isToday) {
                  return date.toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "numeric",
                    minute: "2-digit",
                  });
                }

                return date.toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  month: "short",
                  day: "numeric",
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
