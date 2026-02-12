import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTask, getChildren, addChild, cycleTaskStatus } from "../taskStore";
import type { TaskNode } from "../taskStore";
import "./TaskDetail.css";

const STATUS_BADGE: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  done: { bg: "#ecfdf5", color: "#16a34a", label: "DONE" },
  "in-progress": { bg: "#fff4ed", color: "#ea580c", label: "IN PROGRESS" },
  todo: { bg: "#f5f5f5", color: "#666", label: "TO DO" },
};

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  const [newSubtask, setNewSubtask] = useState("");

  const task = taskId ? getTask(taskId) : undefined;

  if (!task) {
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

  const children = getChildren(task.id);
  const completedCount = children.filter((c) => c.status === "done").length;
  const progressPercent =
    children.length > 0
      ? Math.round((completedCount / children.length) * 100)
      : 0;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    addChild(task.id, newSubtask.trim());
    setNewSubtask("");
    rerender();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddSubtask();
  };

  const handleCycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cycleTaskStatus(id);
    rerender();
  };

  // Build back link: go to parent task, or board if top-level
  const goBack = () => {
    if (task.parentId) {
      navigate(`/tasks/${task.parentId}`);
    } else {
      navigate("/tasks");
    }
  };

  const backLabel = task.parentId
    ? `← Back to ${getTask(task.parentId)?.title || "Parent"}`
    : "← Back to Board";

  return (
    <div className="task-detail-page">
      {/* Top action bar */}
      <div className="td-action-bar">
        <button className="td-back-btn" onClick={goBack}>
          {backLabel}
        </button>
        <div className="td-actions-right">
          <button
            className="td-mark-complete"
            onClick={() => {
              cycleTaskStatus(task.id);
              rerender();
            }}
          >
            {task.status === "done" ? "↩ Reopen" : "✓ Mark Complete"}
          </button>
          <button className="td-icon-btn">🔗</button>
          <button className="td-icon-btn">•••</button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="td-breadcrumb">
        <span className="td-breadcrumb-icon">📁</span>
        {task.breadcrumb.map((crumb, i) => (
          <span key={i}>
            <span className="td-breadcrumb-link">{crumb}</span>
            <span className="td-breadcrumb-sep"> / </span>
          </span>
        ))}
        {task.tag && <span className="td-breadcrumb-tag">{task.tag}</span>}
      </div>

      {/* Title */}
      <h1 className="td-title">{task.title}</h1>

      <div className="td-body">
        {/* Left: main content */}
        <div className="td-main">
          {/* Description */}
          {task.description && (
            <div className="td-section">
              <h3 className="td-section-heading">
                <span className="td-section-icon">📄</span> DESCRIPTION
              </h3>
              <p className="td-description-text">{task.description}</p>
              {task.bullets && task.bullets.length > 0 && (
                <ul className="td-bullets">
                  {task.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Subtasks */}
          <div className="td-section">
            <div className="td-subtasks-header">
              <h3 className="td-section-heading">
                <span className="td-section-icon">📋</span> SUBTASKS
              </h3>
              {children.length > 0 && (
                <div className="td-subtask-progress-info">
                  <span className="td-progress-label">
                    {progressPercent}% COMPLETE
                  </span>
                  <div className="td-progress-track">
                    <div
                      className="td-progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className="td-subtask-list">
              {children.map((child: TaskNode) => {
                const badge = STATUS_BADGE[child.status];
                const hasChildren = child.childIds.length > 0;
                return (
                  <div
                    className={`td-subtask-row ${child.status === "done" ? "completed" : ""}`}
                    key={child.id}
                    onClick={() => navigate(`/tasks/${child.id}`)}
                  >
                    <div
                      className={`td-subtask-check ${child.status === "done" ? "checked" : ""}`}
                      onClick={(e) => handleCycleStatus(child.id, e)}
                    >
                      {child.status === "done" && "✓"}
                    </div>
                    <div className="td-subtask-content">
                      <span
                        className={`td-subtask-title ${child.status === "done" ? "line-through" : ""}`}
                      >
                        {child.title}
                      </span>
                      {hasChildren && (
                        <span className="td-subtask-children-count">
                          {child.childIds.length} subtask
                          {child.childIds.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <span
                      className="td-subtask-badge"
                      style={{ background: badge.bg, color: badge.color }}
                      onClick={(e) => handleCycleStatus(child.id, e)}
                    >
                      {badge.label}
                    </span>
                    {child.flagColor && (
                      <span
                        className="td-subtask-flag"
                        style={{ color: child.flagColor }}
                      >
                        🚩
                      </span>
                    )}
                    <span className="td-subtask-arrow">→</span>
                  </div>
                );
              })}
              {children.length === 0 && (
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
                    onClick={handleAddSubtask}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="td-section">
            <h3 className="td-section-heading">
              <span className="td-section-icon">💬</span> ACTIVITY
            </h3>
            <div className="td-comment-row">
              <div className="td-comment-avatar"></div>
              <input
                type="text"
                className="td-comment-input"
                placeholder="Ask a question or leave a note..."
              />
              <button className="td-comment-send">↑</button>
            </div>
            <div className="td-activity-entry">
              <span className="td-activity-dot">•</span>
              <span className="td-activity-text">
                YOU UPDATED THE STATUS • 2H AGO
              </span>
              <span className="td-activity-link">Show History</span>
            </div>
          </div>
        </div>

        {/* Right: metadata sidebar */}
        <div className="td-sidebar">
          <div className="td-meta-card">
            <div className="td-meta-row">
              <span className="td-meta-label">STATUS</span>
              <span className="td-meta-value">
                <span
                  className="td-meta-dot"
                  style={{ background: task.statusColor || "#6b7280" }}
                ></span>
                {task.status === "done"
                  ? "Done"
                  : task.status === "in-progress"
                    ? "In Progress"
                    : "To Do"}
                <span className="td-meta-chevron">›</span>
              </span>
            </div>
            {task.assignee && (
              <div className="td-meta-row">
                <span className="td-meta-label">ASSIGNEE</span>
                <span className="td-meta-value">
                  <span className="td-meta-avatar"></span>
                  {task.assignee}
                </span>
              </div>
            )}
            {task.dueDate && (
              <div className="td-meta-row">
                <span className="td-meta-label">DUE DATE</span>
                <span className="td-meta-value">📅 {task.dueDate}</span>
              </div>
            )}
            {task.priority && (
              <div className="td-meta-row">
                <span className="td-meta-label">PRIORITY</span>
                <span className="td-meta-value">
                  🚩 {task.priority} <span className="td-meta-chevron">›</span>
                </span>
              </div>
            )}
            {task.project && (
              <div className="td-meta-row">
                <span className="td-meta-label">PROJECT</span>
                <span className="td-meta-value">{task.project}</span>
              </div>
            )}
            {task.parentId && (
              <div className="td-meta-row">
                <span className="td-meta-label">PARENT TASK</span>
                <span
                  className="td-meta-value td-meta-link"
                  onClick={() => navigate(`/tasks/${task.parentId}`)}
                >
                  {getTask(task.parentId)?.title || "Parent"}
                  <span className="td-meta-chevron">↗</span>
                </span>
              </div>
            )}
            {task.created && (
              <div className="td-meta-row">
                <span className="td-meta-label">CREATED</span>
                <span className="td-meta-value">{task.created}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
