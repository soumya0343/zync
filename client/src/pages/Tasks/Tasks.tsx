import { useState, useCallback, useEffect } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import TaskModal from "../../components/TaskModal";
import TasksBoardHeader from "./components/TasksBoardHeader";
import QuickAddBar from "./components/QuickAddBar";
import KanbanColumn from "./components/KanbanColumn";
import LoadingScreen from "../../components/common/LoadingScreen";
import EmptyState from "../../components/common/EmptyState";
import { boardService } from "../../services/boardService";
import { taskService } from "../../services/taskService";
import type { KanbanTask, KanbanStatus } from "../../types";
import "./Tasks.css";

// Helper to map backend task to frontend KanbanTask
const mapToKanbanTask = (task: any): KanbanTask => {
  const priorityMap: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return {
    id: task.id,
    title: task.title,
    category: task.column?.title?.toUpperCase() || "TASK",
    kanbanStatus:
      (task.column?.title.toLowerCase().replace(" ", "-") as KanbanStatus) ||
      "backlog",
    numericPriority: priorityMap[task.priority?.toLowerCase()] ?? 3,
    dueDateLabel: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "No date",
    isUrgent: task.priority === "urgent",
  };
};

const Tasks = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Listen for sidebar "New Task" button
  useEffect(() => {
    const handler = () => setIsTaskModalOpen(true);
    window.addEventListener("open-new-task", handler);
    return () => window.removeEventListener("open-new-task", handler);
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const boards = await boardService.getBoards();
      if (boards.length > 0) {
        setColumns(boards[0].columns);
      } else {
        // Create default board if none exists
        const newBoard = await boardService.createBoard({ title: "My Board" });
        setColumns(newBoard.columns);
      }
    } catch (error) {
      console.error("Failed to fetch boards", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleCardClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleAddTask = async (title: string, columnId: string) => {
    try {
      await taskService.createTask({
        title,
        columnId,
        priority: "medium", // Default
      });
      fetchBoard(); // Refresh board to see new task
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find source and destination columns
    const sourceColIndex = columns.findIndex(
      (c) => c.id === source.droppableId,
    );
    const destColIndex = columns.findIndex(
      (c) => c.id === destination.droppableId,
    );

    if (sourceColIndex === -1 || destColIndex === -1) return;

    const newColumns = [...columns];
    const sourceCol = newColumns[sourceColIndex];
    const destCol = newColumns[destColIndex];

    const sourceTasks = [...sourceCol.tasks];
    const destTasks =
      source.droppableId === destination.droppableId
        ? sourceTasks
        : [...destCol.tasks];

    // Remove from source
    const [movedTask] = sourceTasks.splice(source.index, 1);

    // Add to destination
    destTasks.splice(destination.index, 0, movedTask);

    // Update columns locally
    newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
    if (source.droppableId !== destination.droppableId) {
      newColumns[destColIndex] = { ...destCol, tasks: destTasks };
    }

    setColumns(newColumns);

    // Call API (Optimistic update)
    try {
      await taskService.updateTask(draggableId, {
        columnId: destination.droppableId,
        order: destination.index,
      });
      // Optionally reload board to sync if needed, but optimistic is better UX
    } catch (error) {
      console.error("Failed to move task", error);
      fetchBoard(); // Revert on error
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading board…" />;
  }

  const hasColumns = columns.length > 0;
  const totalTasks = columns.reduce((sum, col) => sum + (col.tasks?.length ?? 0), 0);

  return (
    <div className="tasks-page">
      <TasksBoardHeader />
      <QuickAddBar
        onAddTask={(title) => {
          // Default to first column (usually backlog/todo)
          if (columns.length > 0) {
            handleAddTask(title, columns[0].id);
          }
        }}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {!hasColumns ? (
            <EmptyState
              icon="📋"
              title="No board yet"
              description="Your task board will appear here once set up."
              actionLabel="Add your first task"
              onAction={() => setIsTaskModalOpen(true)}
            />
          ) : totalTasks === 0 ? (
            <div className="tasks-empty-wrapper">
              <EmptyState
                icon="✓"
                title="No tasks yet"
                description="Add a task above or open the menu to create one."
                actionLabel="Add task"
                onAction={() => setIsTaskModalOpen(true)}
                compact
              />
            </div>
          ) : null}
          {hasColumns && totalTasks > 0 && columns.map((col: any) => {
            // Map tasks for this column
            const kanbanTasks = col.tasks.map(mapToKanbanTask);

            // Map column title to a color helper?
            // Using hardcoded colors for now based on title matching
            let color = "#6b7280";
            const lowerTitle = col.title.toLowerCase();
            if (lowerTitle.includes("todo") || lowerTitle.includes("backlog"))
              color = "#6b7280";
            else if (lowerTitle.includes("progress")) color = "#8b5cf6";
            else if (lowerTitle.includes("done")) color = "#16a34a";
            else if (lowerTitle.includes("blocked")) color = "#ef4444";
            else if (lowerTitle.includes("planned")) color = "#f59e0b";

            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                count={col.tasks.length}
                color={color}
                tasks={kanbanTasks}
                onCardClick={handleCardClick}
                onAddTask={(title) => handleAddTask(title, col.id)}
              />
            );
          })}
        </div>
      </DragDropContext>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={fetchBoard}
      />
    </div>
  );
};

export default Tasks;
