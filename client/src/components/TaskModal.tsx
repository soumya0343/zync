import { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { goalService } from "../services/goalService";
import { taskService } from "../services/taskService";
import { boardService } from "../services/boardService";
import "./TaskModal.css";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  parentId?: string;
  type?: "task" | "subtask";
  task?: any; // Task to edit
}

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  parentId,
  type = "task",
  task,
}: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [goalId, setGoalId] = useState("");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [goals, setGoals] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode
        setTitle(task.title || "");
        setDescription(task.description || "");
        setPriority(task.priority || "medium");
        // format date yyyy-mm-dd
        setDueDate(
          task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
        );
        setGoalId(task.goalId || "");
        setLinkedTaskId(task.parentId || "");
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
        .catch((err: any) => console.error("Failed to fetch goals", err));

      // Fetch tasks for linking (if this is a subtask)
      if (type === "subtask") {
        boardService
          .getBoards()
          .then((boards: any[]) => {
            const tasks: any[] = [];
            boards.forEach((board) => {
              board.columns.forEach((col: any) => {
                if (col.tasks) {
                  tasks.push(...col.tasks);
                }
              });
            });
            // Filter out self if editing (though we are creating here)
            // Filter out current parent if we want to change it?
            // Just show all for now.
            setAvailableTasks(tasks);
          })
          .catch((err: any) => console.error("Failed to fetch tasks", err));
      }
    }
  }, [isOpen, type, parentId, task]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      // We need a columnId. For new tasks, default to first column of first board.
      // For subtasks, backend handles it if we pass parentId?
      // Actually subtasks need columnId too usually, or inherit from parent.
      // Let's fetch board to get default column.
      const boards = await boardService.getBoards();
      if (!boards.length) throw new Error("No boards found");

      const defaultBoard = boards[0];
      const defaultColumn = defaultBoard.columns[0]; // Assumes columns exist

      if (!defaultColumn) throw new Error("No columns found");

      const payload: any = {
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
        columnId: defaultColumn.id,
        goalId: goalId || undefined,
      };

      if (type === "subtask" && parentId) {
        payload.parentId = parentId;
      }

      // If user selected a different parent via "Linked Task"
      if (linkedTaskId) {
        payload.parentId = linkedTaskId;
      }

      if (task) {
        await taskService.updateTask(task.id, payload);
      } else {
        await taskService.createTask(payload);
      }
      onSave();
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
        task
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
              onChange={(e) => setPriority(e.target.value)}
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
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
          >
            {loading ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
