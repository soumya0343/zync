import type { KanbanTask } from "../../../types";
import KanbanCard from "./KanbanCard";
import "./TasksComponents.css";

interface KanbanColumnProps {
  title: string;
  count: number;
  color: string;
  tasks: KanbanTask[];
  showAddButton?: boolean;
  onCardClick?: (taskId: string) => void;
}

const KanbanColumn = ({
  title,
  count,
  color,
  tasks,
  showAddButton,
  onCardClick,
}: KanbanColumnProps) => {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <span className="kanban-column-count" style={{ background: color }}>
          {count}
        </span>
        <span className="kanban-column-title">{title}</span>
      </div>
      <div className="kanban-column-body">
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onClick={() => onCardClick?.(task.id)}
          />
        ))}
        {showAddButton && (
          <button className="kanban-add-task-btn">+ Add Task</button>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
