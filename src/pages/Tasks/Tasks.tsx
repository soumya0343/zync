import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import TasksBoardHeader from "./components/TasksBoardHeader";
import QuickAddBar from "./components/QuickAddBar";
import KanbanColumn from "./components/KanbanColumn";
import { KANBAN_TASKS, KANBAN_COLUMNS } from "./mockData";
import { add } from "./taskStore"; // Import add from taskStore
import type { KanbanColumn as KanbanColType } from "./mockData";
import type { KanbanTask, KanbanStatus } from "../../types";
import "./Tasks.css";

const Tasks = () => {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  const handleCardClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAddTask = (title: string, status: KanbanStatus = "backlog") => {
    const newId = `kt-${Date.now()}`;
    const newTask: KanbanTask = {
      id: newId,
      title,
      category: "SCHOOL",
      kanbanStatus: status,
      numericPriority: 3,
      dueDateLabel: "No date",
      isUrgent: false,
    };
    // Add to the shared mutable arrays
    KANBAN_TASKS.push(newTask);

    // Sync to taskStore (global store for details)
    add({
      id: newId,
      title,
      status: status as any, // sync type
      description: "",
      breadcrumb: ["TASKS"],
      childIds: [],
      created: "Just now",
      statusColor: "#6b7280",
    });

    // Update target column immutably for React to detect change
    const targetCol = KANBAN_COLUMNS.find((c) => c.id === status);
    if (targetCol) {
      // Create a NEW array reference
      targetCol.tasks = [...targetCol.tasks, newTask];
      targetCol.count = targetCol.tasks.length;
    }
    rerender();
  };

  return (
    <div className="tasks-page">
      <TasksBoardHeader />
      <QuickAddBar onAddTask={(title) => handleAddTask(title, "backlog")} />
      <div className="kanban-board">
        {KANBAN_COLUMNS.map((col: KanbanColType) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            count={col.count}
            color={col.color}
            tasks={col.tasks}
            onCardClick={handleCardClick}
            onAddTask={(title) => handleAddTask(title, col.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
