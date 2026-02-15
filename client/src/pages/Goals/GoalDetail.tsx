import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { goalService } from "../../services/goalService";
import { boardService } from "../../services/boardService";
import { taskService } from "../../services/taskService";
import type { Task, Goal } from "../../types";
import type { Board, Column } from "../../types";
import { ChevronRight, Calendar, Plus, Edit2 } from "lucide-react";
import TaskItem from "../Dashboard/components/TaskItem";
import TaskModal from "../../components/TaskModal";
import type { GoalCategory } from "./goalData";
import "./Goals.css";

const EDIT_CATEGORY_OPTIONS: { key: GoalCategory; label: string }[] = [
  { key: "short-term", label: "Short-term" },
  { key: "long-term", label: "Long-term" },
  { key: "financial", label: "Financial" },
];

interface GoalDetailType extends Goal {
  tasks?: Task[];
}

const GoalDetail = () => {
  const { goalId } = useParams();
  const [goal, setGoal] = useState<GoalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<GoalCategory>("short-term");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [columnIds, setColumnIds] = useState<{ doneId: string | null; todoId: string | null }>({
    doneId: null,
    todoId: null,
  });

  /* eslint-disable react-hooks/exhaustive-deps */
  const fetchGoal = async () => {
    if (!goalId) return;
    try {
      setLoading(true);
      const data = await goalService.getGoal(goalId);
      setGoal(data);
    } catch (err) {
      setError("Failed to load goal details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoal();
  }, [goalId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    boardService
      .getBoards()
      .then((boards: Board[]) => {
        let doneId: string | null = null;
        let todoId: string | null = null;
        for (const board of boards) {
          const cols = board.columns || [];
          const firstColId = cols[0]?.id ?? null;
          for (const col of cols) {
            const title = (col as Column).title?.toLowerCase() ?? "";
            if (title === "done") doneId = (col as Column).id;
            if (title === "todo" || title === "to do") todoId = (col as Column).id;
          }
          if (!todoId && firstColId) todoId = firstColId;
          if (doneId && todoId) break;
        }
        setColumnIds({ doneId, todoId });
      })
      .catch(() => setColumnIds({ doneId: null, todoId: null }));
  }, []);

  const handleTaskUpdate = () => {
    fetchGoal();
  };

  const handleEditSave = async () => {
    if (!goalId || !editTitle.trim()) return;
    try {
      await goalService.updateGoal(goalId, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        category: editCategory,
        dueDate: editTargetDate || undefined,
      });
      await fetchGoal();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Failed to update goal", err);
    }
  };

  const handleToggleTaskComplete = async (taskId: string, completed: boolean) => {
    const { doneId, todoId } = columnIds;
    const targetColumnId = completed ? doneId : todoId;
    if (!targetColumnId) return;
    try {
      await taskService.updateTask(taskId, { columnId: targetColumnId });
      await fetchGoal();
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        Loading...
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div style={{ padding: "2rem" }}>
        <p style={{ color: "red" }}>{error || "Goal not found"}</p>
        <Link to="/goals">Back to Goals</Link>
      </div>
    );
  }

  const daysRemaining = goal.targetDate
    ? Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const isTaskCompleted = (t: Task & { column?: { title?: string } }) =>
    t.column?.title?.toLowerCase() === "done" || t.status === "done";
  const totalTasks = goal.tasks?.length ?? 0;
  const completedTasks =
    goal.tasks?.filter((t) => isTaskCompleted(t as Task & { column?: { title?: string } })).length ?? 0;
  // Progress is normalized from tasks in goalService so dashboard, goals list, and detail all match
  const progress = goal.progress;

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Breadcrumbs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#6b7280",
          fontSize: "0.875rem",
          marginBottom: "1.5rem",
        }}
      >
        <Link
          to="/goals"
          style={{
            color: "#6b7280",
            textDecoration: "none",
            fontWeight: 500,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          GOALS
        </Link>
        <ChevronRight size={14} />
        <span
          style={{
            fontWeight: 600,
            color: "#111827",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          DETAIL
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "0.5rem",
              letterSpacing: "-0.025em",
            }}
          >
            {goal.title}
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "1rem",
              lineHeight: "1.5",
              maxWidth: "800px",
            }}
          >
            {goal.description || "No description provided."}
          </p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={() => {
            setEditTitle(goal.title);
            setEditDescription(goal.description ?? "");
            setEditCategory((goal.category as GoalCategory) ?? "short-term");
            setEditTargetDate(goal.targetDate ? goal.targetDate.slice(0, 10) : "");
            setIsEditModalOpen(true);
          }}
        >
          <Edit2 size={16} />
          Edit Goal
        </button>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        {/* Progress Card */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              PROGRESS
            </span>
            <span
              style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}
            >
              {progress}%
            </span>
          </div>
          <div
            style={{
              height: "8px",
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
              marginBottom: "0.5rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#000",
                borderRadius: "4px",
              }}
            />
          </div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>

        {/* Deadline Card */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            DEADLINE
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <Calendar size={18} color="#6b7280" />
            <span
              style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}
            >
              {goal.targetDate
                ? new Date(goal.targetDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No Deadline"}
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {daysRemaining > 0
              ? `${daysRemaining} days remaining`
              : daysRemaining < 0
                ? "Overdue"
                : "Due today"}
          </p>
        </div>

        {/* Status Card */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #f3f4f6",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            STATUS
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: progress === 100 ? "#10b981" : "#000",
              }}
            />
            <span
              style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}
            >
              {progress === 100 ? "Completed" : "Active"}
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            Updated recently
          </p>
        </div>
      </div>

      {/* Linked Tasks */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#111827",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Linked Tasks
          </h3>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {goal.tasks && goal.tasks.length > 0 ? (
            goal.tasks.map((task) => {
              const completed = isTaskCompleted(task as Task & { column?: { title?: string } });
              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <TaskItem
                    task={task}
                    completed={completed}
                    onToggleComplete={handleToggleTaskComplete}
                    statusLabel={(task as Task & { column?: { title?: string } }).column?.title ?? task.status ?? "Todo"}
                  />
                </Link>
              );
            })
          ) : (
            <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
              No tasks linked to this goal yet.
            </p>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleTaskUpdate}
        initialGoalId={goal.id}
      />

      {/* Edit Goal Modal */}
      {isEditModalOpen && (
        <div
          className="goal-modal-overlay"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h2>Edit Goal</h2>
              <button
                type="button"
                className="goal-modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="goal-modal-body">
              <label className="goal-form-label">
                Goal Title
                <input
                  type="text"
                  className="goal-form-input"
                  placeholder="e.g. Learn Machine Learning"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </label>
              <label className="goal-form-label">
                Description
                <textarea
                  className="goal-form-textarea"
                  placeholder="What do you want to achieve?"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </label>
              <div className="goal-form-row">
                <label className="goal-form-label goal-form-half">
                  Category
                  <select
                    className="goal-form-select"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as GoalCategory)}
                  >
                    {EDIT_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="goal-form-label goal-form-half">
                  Due Date
                  <input
                    type="date"
                    className="goal-form-input"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="goal-modal-footer">
              <button
                type="button"
                className="goal-btn-cancel"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="goal-btn-create"
                onClick={handleEditSave}
                disabled={!editTitle.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetail;
