import { MOCK_TASK_DETAIL } from "./taskDetailData";
import type { SubTask } from "./taskDetailData";
import "./TaskDetailDrawer.css";

interface TaskDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_BADGE: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  done: { bg: "#f0f0f0", color: "#666", label: "DONE" },
  "in-progress": { bg: "#fff4ed", color: "#ea580c", label: "IN PROGRESS" },
  todo: { bg: "#f0f0f0", color: "#666", label: "TO DO" },
};

const SubTaskItem = ({ subtask }: { subtask: SubTask }) => {
  const badge = STATUS_BADGE[subtask.status];
  return (
    <div
      className={`subtask-item ${subtask.status === "done" ? "completed" : ""}`}
    >
      <div className="subtask-checkbox">
        {subtask.status === "done" ? (
          <span className="subtask-check-done">✓</span>
        ) : (
          <span className="subtask-check-empty"></span>
        )}
      </div>
      <span
        className={`subtask-title ${subtask.status === "done" ? "line-through" : ""}`}
      >
        {subtask.title}
      </span>
      <span
        className="subtask-status-badge"
        style={{ background: badge.bg, color: badge.color }}
      >
        {badge.label}
      </span>
      {subtask.hasPriorityFlag && (
        <span className="subtask-flag" style={{ color: subtask.flagColor }}>
          🚩
        </span>
      )}
    </div>
  );
};

const TaskDetailDrawer = ({ isOpen, onClose }: TaskDetailDrawerProps) => {
  const task = MOCK_TASK_DETAIL;

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose}></div>}
      <div className={`task-detail-drawer ${isOpen ? "open" : ""}`}>
        {/* Action Bar */}
        <div className="drawer-action-bar">
          <div className="drawer-actions-left">
            <button className="btn-mark-complete">✓ Mark Complete</button>
            <button className="drawer-icon-btn">👤</button>
            <button className="drawer-icon-btn">↗</button>
          </div>
          <div className="drawer-actions-right">
            <button className="drawer-icon-btn">🔗</button>
            <button className="drawer-icon-btn">•••</button>
            <button className="drawer-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="drawer-breadcrumb">
          <span className="breadcrumb-icon">📁</span>
          {task.breadcrumb.map((crumb, i) => (
            <span key={i}>
              <span className="breadcrumb-text">{crumb}</span>
              <span className="breadcrumb-sep"> / </span>
            </span>
          ))}
          <span className="breadcrumb-tag">{task.tag}</span>
        </div>

        {/* Title */}
        <h1 className="drawer-title">{task.title}</h1>

        {/* Metadata */}
        <div className="drawer-metadata">
          <div className="meta-row">
            <span className="meta-label">STATUS</span>
            <span className="meta-value">
              <span
                className="meta-dot"
                style={{ background: task.statusColor }}
              ></span>
              {task.status} <span className="meta-chevron">›</span>
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">ASSIGNEE</span>
            <span className="meta-value">
              <span className="meta-avatar"></span>
              {task.assignee}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">DUE DATE</span>
            <span className="meta-value">
              <span className="meta-icon">📅</span>
              {task.dueDate}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">PRIORITY</span>
            <span className="meta-value">
              {task.priorityIcon} {task.priority}{" "}
              <span className="meta-chevron">›</span>
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="drawer-section">
          <h3 className="drawer-section-title">
            <span className="section-icon">📄</span> DESCRIPTION
          </h3>
          <p className="drawer-description">{task.description}</p>
          <ul className="drawer-bullets">
            {task.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>

        {/* Subtasks */}
        <div className="drawer-section">
          <div className="subtasks-header">
            <h3 className="drawer-section-title">
              <span className="section-icon">📋</span> SUBTASKS
            </h3>
            <div className="subtask-progress-info">
              <span className="subtask-progress-text">
                {task.subtaskProgress}% COMPLETE
              </span>
              <div className="subtask-progress-bar">
                <div
                  className="subtask-progress-fill"
                  style={{ width: `${task.subtaskProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="subtasks-list">
            {task.subtasks.map((st) => (
              <SubTaskItem key={st.id} subtask={st} />
            ))}
            <div className="subtask-add">
              <span className="subtask-add-icon">+</span>
              <span className="subtask-add-text">What needs to be done?</span>
            </div>
          </div>
        </div>

        {/* Activity / Comment */}
        <div className="drawer-activity">
          <div className="comment-input-row">
            <div className="comment-avatar"></div>
            <input
              type="text"
              className="comment-input"
              placeholder="Ask a question or leave a note..."
            />
            <button className="comment-send-btn">↑</button>
          </div>
          <div className="activity-log">
            <span className="activity-dot">•</span>
            <span className="activity-text">ACTIVITY: {task.activityLog}</span>
            <span className="activity-show-history">Show History</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetailDrawer;
