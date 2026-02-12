import { PRIORITY_GROUPS } from "../mockData";
import type { KanbanTask } from "../../../types";
import "./TasksComponents.css";

interface PriorityViewProps {
  onCardClick?: (taskId: string) => void;
}

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  backlog: { label: "Backlog", color: "#6b7280", bg: "#f3f4f6" },
  planned: { label: "Planned", color: "#f59e0b", bg: "#fffbeb" },
  "in-progress": { label: "In Progress", color: "#8b5cf6", bg: "#f5f3ff" },
  blocked: { label: "Blocked", color: "#ef4444", bg: "#fef2f2" },
  done: { label: "Done", color: "#16a34a", bg: "#f0fdf4" },
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  SCHOOL: { bg: "#eef0ff", color: "#4f46e5" },
  LIFE: { bg: "#fff4ed", color: "#ea580c" },
  WORK: { bg: "#f0fdf4", color: "#16a34a" },
};

const PriorityRow = ({
  task,
  onClick,
}: {
  task: KanbanTask;
  onClick?: () => void;
}) => {
  const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.WORK;
  const statusInfo = STATUS_LABEL[task.kanbanStatus] || STATUS_LABEL.backlog;

  return (
    <div className="priority-row" onClick={onClick}>
      <div className="priority-row-left">
        <span className="priority-row-checkbox"></span>
        <span className="priority-row-title">{task.title}</span>
        <span
          className="priority-row-tag"
          style={{ background: catStyle.bg, color: catStyle.color }}
        >
          {task.category}
        </span>
      </div>
      <div className="priority-row-right">
        <span
          className="priority-row-status"
          style={{ background: statusInfo.bg, color: statusInfo.color }}
        >
          {statusInfo.label}
        </span>
        <span className={`priority-row-date ${task.isUrgent ? "urgent" : ""}`}>
          {task.dueDateLabel || "—"}
        </span>
        {task.progressPercent !== undefined && (
          <div className="priority-row-progress">
            <div
              className="priority-row-progress-fill"
              style={{
                width: `${task.progressPercent}%`,
                background: task.progressColor || "#7c3aed",
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

const PriorityView = ({ onCardClick }: PriorityViewProps) => {
  return (
    <div className="priority-view">
      {PRIORITY_GROUPS.map((group) => (
        <div className="priority-group" key={group.priority}>
          <div className="priority-group-header">
            <span
              className="priority-group-badge"
              style={{ background: group.color }}
            >
              P{group.priority}
            </span>
            <span className="priority-group-label">{group.label}</span>
            <span className="priority-group-count">{group.tasks.length}</span>
          </div>
          <div className="priority-group-list">
            {group.tasks.length > 0 ? (
              group.tasks.map((task) => (
                <PriorityRow
                  key={task.id}
                  task={task}
                  onClick={() => onCardClick?.(task.id)}
                />
              ))
            ) : (
              <div className="priority-empty">No tasks</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PriorityView;
