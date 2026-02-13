import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TasksBoardHeader from "./components/TasksBoardHeader";
import QuickAddBar from "./components/QuickAddBar";
import KanbanColumn from "./components/KanbanColumn";
import { KANBAN_TASKS, KANBAN_COLUMNS } from "./mockData";
import type { KanbanColumn as KanbanColType } from "./mockData";
import type { KanbanTask } from "../../types";
import "./Tasks.css";

const Tasks = () => {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  const handleCardClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAddTask = (title: string) => {
    const newId = `kt-${Date.now()}`;
    const newTask: KanbanTask = {
      id: newId,
      title,
      category: "SCHOOL",
      kanbanStatus: "backlog",
      numericPriority: 3,
      dueDateLabel: "No date",
      isUrgent: false,
    };
    // Add to the shared mutable arrays
    KANBAN_TASKS.push(newTask);
    // Update backlog column
    const backlogCol = KANBAN_COLUMNS.find((c) => c.id === "backlog");
    if (backlogCol) {
      backlogCol.tasks.push(newTask);
      backlogCol.count = backlogCol.tasks.length;
    }
    rerender();
  };

  return (
    <div className="tasks-page">
      <TasksBoardHeader />
      <QuickAddBar onAddTask={handleAddTask} />
      <div className="kanban-board">
        {KANBAN_COLUMNS.map((col: KanbanColType) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            count={col.count}
            color={col.color}
            tasks={col.tasks}
            showAddButton={col.id === "backlog"}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
