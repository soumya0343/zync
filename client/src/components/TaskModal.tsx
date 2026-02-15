import { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { goalService } from "../services/goalService";
import {
  taskService,
  type CreateTaskDto,
  type UpdateTaskDto,
} from "../services/taskService";
import { boardService } from "../services/boardService";
import type { Task, Goal, TaskPriority, Board } from "../types";
import "./TaskModal.css";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  parentId?: string;
  /** When creating a subtask, use this column so the subtask starts in the same column as the parent */
  parentColumnId?: string;
  type?: "task" | "subtask";
  taskToEdit?: Task;
  initialGoalId?: string;
  initialParentId?: string;
}

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  parentId,
  parentColumnId,
  type = "task",
  taskToEdit,
  initialGoalId,
}: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [, setStatus] = useState("todo");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [goalId, setGoalId] = useState(initialGoalId || "");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        // Edit mode
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description || "");
        setPriority(taskToEdit.priority || "medium");
        // format date yyyy-mm-dd
        setDueDate(
          taskToEdit.dueDate
            ? new Date(taskToEdit.dueDate).toISOString().split("T")[0]
            : "",
        );
        setGoalId(taskToEdit.goalId || initialGoalId || "");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setStatus(taskToEdit.status || (taskToEdit.columnId as any) || "todo");
        setLinkedTaskId(taskToEdit?.id || ""); // Keep this line for edit mode
      } else {
        // Create mode
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        setGoalId("");
        setLinkedTaskId(parentId || "");
      }

      // Fetch goals
      goalService
        .getGoals()
        .then(setGoals)
        .catch((err: unknown) => console.error("Failed to fetch goals", err));

      // Fetch tasks for linking (if this is a subtask)
      if (type === "subtask") {
        boardService
          .getBoards()
          .then((boards: Board[]) => {
            const tasks: Task[] = [];
            boards.forEach((board) => {
              board.columns.forEach((col) => {
                if (col.tasks) {
                  tasks.push(...col.tasks);
                }
              });
            });
            setAvailableTasks(tasks);
          })
          .catch((err: unknown) => console.error("Failed to fetch tasks", err));
      }
    }
  }, [isOpen, type, parentId, taskToEdit, initialGoalId]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const boards = (await boardService.getBoards()) as Board[];
      if (!boards.length) throw new Error("No boards found");

      const defaultBoard = boards[0];
      const defaultColumn = defaultBoard.columns[0]; // Assumes columns exist

      if (!defaultColumn) throw new Error("No columns found");

      if (taskToEdit) {
        const payload: UpdateTaskDto = {
          title,
          description,
          priority,
          dueDate: dueDate || undefined,
          goalId: goalId || undefined,
          parentId:
            linkedTaskId ||
            (type === "subtask" && parentId ? parentId : undefined) ||
            undefined,
          columnId: taskToEdit.columnId || defaultColumn.id,
        };
        await taskService.updateTask(taskToEdit.id, payload);
      } else {
        const columnIdForNewTask =
          type === "subtask" && parentColumnId
            ? parentColumnId
            : defaultBoard.columns.find((c) => c.title.toLowerCase() === "todo")?.id ||
              defaultColumn.id;
        const payload: CreateTaskDto = {
          title,
          description,
          priority,
          dueDate: dueDate || undefined,
          columnId: columnIdForNewTask,
          goalId: goalId || undefined,
          parentId:
            linkedTaskId ||
            (type === "subtask" && parentId ? parentId : undefined) ||
            undefined,
        };
        await taskService.createTask(payload);
      }
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save task", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        taskToEdit
          ? "Edit Task"
          : type === "subtask"
            ? "Create Subtask"
            : "Create New Task"
      }
    >
      <div className="task-modal-form">
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Design System Update"
            autoFocus
          />
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={4}
          />
        </label>

        <div className="form-row">
          <label>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🔵 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </label>

          <label>
            Due Date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>
        </div>

        <label>
          Linked Goal
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            <option value="">Select a goal...</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </label>

        {type === "subtask" && (
          <label>
            Linked Task (Parent)
            <select
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
            >
              <option value="">Select a parent task...</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="modal-actions">
          <button className="task-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="task-modal-btn-primary"
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
          >
            {loading
              ? "Saving..."
              : taskToEdit
                ? "Save Changes"
                : "Create Task"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
