import { useState } from "react";
import { Droppable } from "@hello-pangea/dnd";
import type { KanbanTask } from "../../../types";
import KanbanCard from "./KanbanCard";
import "./TasksComponents.css";

interface KanbanColumnProps {
  id: string; // added to identify column
  title: string;
  count: number;
  color: string;
  tasks: KanbanTask[];
  onCardClick?: (taskId: string) => void;
  onAddTask?: (title: string) => void;
}

const KanbanColumn = ({
  id,
  title,
  count,
  color,
  tasks,
  onCardClick,
  onAddTask,
}: KanbanColumnProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const handleAddSubmit = () => {
    if (!newTitle.trim()) {
      setIsAdding(false);
      return;
    }
    onAddTask?.(newTitle);
    setNewTitle("");
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddSubmit();
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewTitle("");
    }
  };

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <span className="kanban-column-count" style={{ background: color }}>
          {count}
        </span>
        <span className="kanban-column-title">{title}</span>
      </div>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            className="kanban-column-body"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onCardClick?.(task.id)}
              />
            ))}
            {provided.placeholder}

            {isAdding ? (
              <div className="kanban-add-input-wrapper">
                <input
                  autoFocus
                  className="kanban-add-input"
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    // Optional: submit on blur or cancel? Let's submit if non-empty
                    if (newTitle.trim()) handleAddSubmit();
                    else setIsAdding(false);
                  }}
                />
              </div>
            ) : (
              <button
                className="kanban-add-task-btn"
                onClick={() => setIsAdding(true)}
              >
                + Add Task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
