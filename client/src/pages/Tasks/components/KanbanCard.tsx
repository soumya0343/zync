import type { KanbanTask } from "../../../types";
import { Draggable } from "@hello-pangea/dnd";
import "./TasksComponents.css";

interface KanbanCardProps {
  task: KanbanTask;
  index: number;
  onClick?: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  SCHOOL: { bg: "#eef0ff", color: "#4f46e5" },
  LIFE: { bg: "#fff4ed", color: "#ea580c" },
  WORK: { bg: "#f0fdf4", color: "#16a34a" },
};

const PRIORITY_COLORS: Record<number, string> = {
  0: "#ef4444",
  1: "#f59e0b",
  2: "#6b7280",
  3: "#adb5bd",
};

const KanbanCard = ({ task, index, onClick }: KanbanCardProps) => {
  const catStyle = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.WORK;
  const priColor = PRIORITY_COLORS[task.numericPriority] ?? "#adb5bd";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="kanban-card"
          onClick={onClick}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <div className="kanban-card-top">
            <span
              className="kanban-category-tag"
              style={{ background: catStyle.bg, color: catStyle.color }}
            >
              {task.category}
            </span>
          </div>
          <h3 className="kanban-card-title">{task.title}</h3>
          <div className="kanban-card-footer">
            <span
              className={`kanban-card-date ${task.isUrgent ? "urgent" : ""}`}
            >
              {task.isUrgent ? "🔴" : "📅"} {task.dueDateLabel || "No date"}
            </span>
            <span className="kanban-card-priority" style={{ color: priColor }}>
              P{task.numericPriority}
            </span>
          </div>
          {task.progressPercent !== undefined && (
            <div className="kanban-progress-track">
              <div
                className="kanban-progress-fill"
                style={{
                  width: `${task.progressPercent}%`,
                  background: task.progressColor || "#7c3aed",
                }}
              ></div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
