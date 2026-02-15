import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService } from "../../../services/taskService";
import { boardService } from "../../../services/boardService";
import "./TaskDetail.css";

// Helper to map backend task to UI format
const mapTaskToUI = (task: any) => {
  const status = task.column?.title.toLowerCase().replace(" ", "-") || "todo";
  const priority = task.priority?.toLowerCase() || "medium";

  const colors: Record<string, string> = {
    backlog: "#6b7280",
    todo: "#6b7280",
    planned: "#f59e0b",
    "in-progress": "#8b5cf6",
    blocked: "#ef4444",
    done: "#16a34a",
  };

  return {
    ...task,
    status,
    priority,
    statusColor: colors[status] || "#6b7280",
    breadcrumb: ["TASKS", task.column?.board?.title || "Board"],
    tag: "TASK",
    assignee: "Me", // Hardcoded for now
    dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null,
    created: new Date(task.createdAt).toLocaleDateString(),
    bullets: [],
    subtasks: task.subtasks || [],
  };
};

const STATUS_BADGE: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  done: { bg: "#ecfdf5", color: "#16a34a", label: "DONE" },
  "in-progress": { bg: "#fff4ed", color: "#ea580c", label: "IN PROGRESS" },
  todo: { bg: "#f5f5f5", color: "#666", label: "TO DO" },
  backlog: { bg: "#f3f4f6", color: "#4b5563", label: "BACKLOG" },
  planned: { bg: "#fffbeb", color: "#d97706", label: "PLANNED" },
  blocked: { bg: "#fef2f2", color: "#dc2626", label: "BLOCKED" },
};

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  // We need columns to move task
  const [columns, setColumns] = useState<any[]>([]);
  const [newSubtask, setNewSubtask] = useState("");

  const fetchTask = useCallback(async () => {
    if (!taskId) return;
    try {
      const data = await taskService.getTask(taskId);
      setTask(mapTaskToUI(data));

      // Also fetch board to get columns for status changing
      if (data.column?.boardId) {
        const board = await boardService.getBoard(data.column.boardId);
        setColumns(board.columns || []);
      }
    } catch (err) {
      console.error(err);
      setError("Task not found"); // generic message
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleStatusChange = async (colId: string) => {
    if (!task || !task.id) return;
    try {
      await taskService.updateTask(task.id, { columnId: colId });
      fetchTask(); // Refresh
      setIsStatusOpen(false);
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleMarkComplete = async () => {
    // Find "done" column
    const doneCol = columns.find((c) => c.title.toLowerCase() === "done");
    if (doneCol) {
      handleStatusChange(doneCol.id);
    } else {
      alert("No 'Done' column found.");
    }
  };

  const handleCreateSubtask = async () => {
    if (!newSubtask.trim() || !task) return;

    // Find "todo" or first column
    const defaultCol =
      columns.find((c) => c.title.toLowerCase().includes("todo")) || columns[0];

    if (!defaultCol) {
      alert("Cannot create subtask: No column found.");
      return;
    }

    try {
      await taskService.createTask({
        title: newSubtask,
        columnId: defaultCol.id,
        parentId: task.id,
      });
      setNewSubtask("");
      fetchTask();
    } catch (error) {
      console.error("Failed to create subtask", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateSubtask();
  };

  if (loading) return <div className="task-detail-page">Loading...</div>;

  if (error || !task) {
    return (
      <div className="task-detail-page">
        <div className="td-action-bar">
          <button className="td-back-btn" onClick={() => navigate("/tasks")}>
            ← Back to Board
          </button>
        </div>
        <div className="td-not-found">
          <h2>Task not found</h2>
          <p>The task you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      {/* Top action bar */}
      <div className="td-action-bar">
        <button className="td-back-btn" onClick={() => navigate("/tasks")}>
          ← Back to Board
        </button>
        <div className="td-actions-right">
          <button className="td-mark-complete" onClick={handleMarkComplete}>
            {task.status === "done" ? "✓ Completed" : "✓ Mark Complete"}
          </button>
          <button className="td-icon-btn">🔗</button>
          <button className="td-icon-btn">•••</button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="td-breadcrumb">
        <span className="td-breadcrumb-icon">📁</span>
        {task.breadcrumb?.map((crumb: string, i: number) => (
          <span key={i}>
            <span className="td-breadcrumb-link">{crumb}</span>
            <span className="td-breadcrumb-sep"> / </span>
          </span>
        ))}
        <span className="td-breadcrumb-tag">{task.tag}</span>
      </div>

      {/* Title */}
      <h1 className="td-title">{task.title}</h1>

      <div className="td-body">
        {/* Left: main content */}
        <div className="td-main">
          {/* Description */}
          {task.description ? (
            <div className="td-section">
              <h3 className="td-section-heading">
                <span className="td-section-icon">📄</span> DESCRIPTION
              </h3>
              <p className="td-description-text">{task.description}</p>
            </div>
          ) : (
            <div className="td-section">
              <p className="td-description-placeholder">
                No description provided.
              </p>
            </div>
          )}

          {/* Subtasks - Placeholder for now */}
          <div className="td-section">
            <div className="td-subtasks-header">
              <h3 className="td-section-heading">
                <span className="td-section-icon">📋</span> SUBTASKS
              </h3>
              {/* Not implemented backend */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="td-subtask-progress-info">
                  <span className="td-progress-label">
                    {Math.round(
                      (task.subtasks.filter(
                        (t: any) => t.column?.title?.toLowerCase() === "done",
                      ).length /
                        task.subtasks.length) *
                        100,
                    )}
                    % COMPLETE
                  </span>
                  <div className="td-progress-track">
                    <div
                      className="td-progress-fill"
                      style={{
                        width: `${Math.round((task.subtasks.filter((t: any) => t.column?.title?.toLowerCase() === "done").length / task.subtasks.length) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="td-subtask-list">
              {task.subtasks &&
                task.subtasks.map((child: any) => {
                  const childStatus =
                    child.column?.title?.toLowerCase().replace(" ", "-") ||
                    "todo";
                  const badge =
                    STATUS_BADGE[childStatus] || STATUS_BADGE["todo"];

                  return (
                    <div
                      className={`td-subtask-row ${childStatus === "done" ? "completed" : ""}`}
                      key={child.id}
                      onClick={() => navigate(`/tasks/${child.id}`)}
                    >
                      <div
                        className={`td-subtask-check ${childStatus === "done" ? "checked" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle logic would go here
                        }}
                      >
                        {childStatus === "done" && "✓"}
                      </div>
                      <div className="td-subtask-content">
                        <span
                          className={`td-subtask-title ${childStatus === "done" ? "line-through" : ""}`}
                        >
                          {child.title}
                        </span>
                      </div>
                      <span
                        className="td-subtask-badge"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                      <span className="td-subtask-arrow">→</span>
                    </div>
                  );
                })}

              {(!task.subtasks || task.subtasks.length === 0) && (
                <div className="td-empty-subtasks">
                  No subtasks yet. Add one below to break this task down.
                </div>
              )}

              <div className="td-subtask-add-row">
                <span className="td-subtask-add-icon">+</span>
                <input
                  type="text"
                  className="td-subtask-add-input"
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {newSubtask.trim() && (
                  <button
                    className="td-subtask-add-btn"
                    onClick={handleCreateSubtask}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: metadata sidebar */}
        <div className="td-sidebar">
          <div className="td-meta-card">
            <div className="td-meta-row">
              <span className="td-meta-label">STATUS</span>
              <div className="td-status-dropdown-container">
                <div
                  className="td-meta-value td-status-trigger"
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                >
                  <span
                    className="td-meta-dot"
                    style={{ background: task.statusColor }}
                  ></span>
                  {task.status.toUpperCase().replace("-", " ")}
                  <span className="td-meta-chevron">›</span>
                </div>

                {isStatusOpen && (
                  <div className="td-status-dropdown-menu">
                    {columns.map((col) => {
                      let color = "#6b7280";
                      const lowerTitle = col.title.toLowerCase();
                      if (lowerTitle.includes("todo")) color = "#6b7280";
                      else if (lowerTitle.includes("progress"))
                        color = "#8b5cf6";
                      else if (lowerTitle.includes("done")) color = "#16a34a";
                      else if (lowerTitle.includes("blocked"))
                        color = "#ef4444";

                      return (
                        <div
                          key={col.id}
                          className="td-status-option"
                          onClick={() => handleStatusChange(col.id)}
                        >
                          <span
                            className="td-status-option-dot"
                            style={{ background: color }}
                          ></span>
                          {col.title}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="td-meta-row">
              <span className="td-meta-label">ASSIGNEE</span>
              <span className="td-meta-value">
                <span className="td-meta-avatar"></span>
                {task.assignee}
              </span>
            </div>

            {task.dueDate && (
              <div className="td-meta-row">
                <span className="td-meta-label">DUE DATE</span>
                <span className="td-meta-value">📅 {task.dueDate}</span>
              </div>
            )}

            <div className="td-meta-row">
              <span className="td-meta-label">PRIORITY</span>
              <span className="td-meta-value">🚩 {task.priority}</span>
            </div>

            <div className="td-meta-row">
              <span className="td-meta-label">CREATED</span>
              <span className="td-meta-value">{task.created}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
