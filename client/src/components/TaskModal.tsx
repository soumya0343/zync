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
  const [dueTime, setDueTime] = useState(""); // HH:mm, empty = use default 23:59 when date is set
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
        if (taskToEdit.dueDate) {
          const d = new Date(taskToEdit.dueDate);
          const istDateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
          setDueDate(istDateFmt.format(d));
          const fmt = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          const parts = fmt.formatToParts(d);
          const h = parts.find((p) => p.type === "hour")?.value ?? "23";
          const min = parts.find((p) => p.type === "minute")?.value ?? "59";
          const utcH = d.getUTCHours();
          const utcM = d.getUTCMinutes();
          const isMidnightUtc = utcH === 0 && utcM === 0;
          setDueTime(isMidnightUtc ? "23:59" : `${h.padStart(2, "0")}:${min.padStart(2, "0")}`);
        } else {
          setDueDate("");
          setDueTime("");
        }
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
        setDueTime("");
        setGoalId("");
        setLinkedTaskId(parentId || "");
      }

      // Fetch goals and, for subtask, boards in parallel to open modal faster
      if (type === "subtask") {
        Promise.all([goalService.getGoals(), boardService.getBoards()])
          .then(([goalsData, boards]: [Goal[], Board[]]) => {
            setGoals(goalsData);
            const tasks: Task[] = [];
            boards.forEach((board: Board) => {
              board.columns?.forEach((col) => {
                if (col.tasks) tasks.push(...col.tasks);
              });
            });
            setAvailableTasks(tasks);
          })
          .catch((err: unknown) => console.error("Failed to fetch goals/tasks", err));
      } else {
        goalService
          .getGoals()
          .then(setGoals)
          .catch((err: unknown) => console.error("Failed to fetch goals", err));
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

      // Due datetime: if time given use it as IST; if only date, default to 11:59 PM IST
      const IST_OFFSET_MINUTES = 5 * 60 + 30; // UTC+5:30
      const dueDatePayload = dueDate
        ? (() => {
            const [y, m, d] = dueDate.split("-").map(Number);
            if (dueTime && /^\d{1,2}:\d{2}$/.test(dueTime.trim())) {
              const [hh, mm] = dueTime.trim().split(":").map(Number);
              const dt = new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0));
              dt.setUTCMinutes(dt.getUTCMinutes() - IST_OFFSET_MINUTES);
              return dt.toISOString();
            }
            // Default 11:59 PM IST: 23:59 IST = 18:29 UTC
            const endOfDayIST = new Date(Date.UTC(y, m - 1, d, 18, 29, 59, 999));
            return endOfDayIST.toISOString();
          })()
        : undefined;

      if (taskToEdit) {
        const payload: UpdateTaskDto = {
          title,
          description,
          priority,
          dueDate: dueDatePayload,
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
          dueDate: dueDatePayload,
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
              onChange={(e) => {
                const v = e.target.value;
                setDueDate(v);
                if (v && !dueTime) setDueTime("23:59");
                if (!v) setDueTime("");
              }}
              aria-label="Due date"
            />
          </label>

          <label title="Default 11:59 PM IST">
            Due Time (IST)
            <input
              type="time"
              value={dueDate ? (dueTime || "23:59") : dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              aria-label="Due time (default 11:59 PM IST)"
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
