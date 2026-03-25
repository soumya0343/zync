import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { goalService } from "../../services/goalService";
import type { Goal } from "../../types";
import LoadingScreen from "../../components/common/LoadingScreen";
import EmptyState from "../../components/common/EmptyState";
import { CATEGORY_CONFIG } from "./goalData";
import type { GoalCategory } from "./goalData";
import "./Goals.css";

type TabFilter = "all" | GoalCategory | "completed";
type SortKey = "date" | "progress" | "name";

const TABS: { key: TabFilter; label: string }[] = [
  { key: "all", label: "All Goals" },
  { key: "short-term", label: "Short-term" },
  { key: "long-term", label: "Long-term" },
  { key: "completed", label: "Completed" },
];

const CATEGORY_OPTIONS: { key: GoalCategory; label: string }[] = [
  { key: "short-term", label: "Short-term" },
  { key: "long-term", label: "Long-term" },
  { key: "financial", label: "Financial" },
];

const Goals = () => {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<SortKey>("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState<GoalCategory>("short-term");
  const [editDueDate, setEditDueDate] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await goalService.getGoals();
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    const handler = () => setShowCreate(true);
    window.addEventListener("open-new-goal", handler);
    return () => window.removeEventListener("open-new-goal", handler);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("short-term");
  const [newDueDate, setNewDueDate] = useState("");

  const filtered = goals
    .filter((g) => {
      if (activeTab === "completed") return g.progress >= 100;
      if (activeTab !== "all" && g.category !== activeTab) return false;
      if (activeTab === "all" && g.progress >= 100) return false; // hide completed from "all"
      if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "progress") return b.progress - a.progress;
      // date: soonest first
      const da = a.targetDate ? new Date(a.targetDate).getTime() : Infinity;
      const db = b.targetDate ? new Date(b.targetDate).getTime() : Infinity;
      return da - db;
    });

  const activeCount = goals.filter((g) => g.progress < 100).length;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      await goalService.createGoal({
        title: newTitle.trim(),
        description: newDesc.trim() || "No description yet.",
        category: newCategory,
        dueDate: newDueDate || undefined,
      });
      fetchGoals();
      setNewTitle("");
      setNewDesc("");
      setNewCategory("short-term");
      setNewDueDate("");
      setShowCreate(false);
    } catch (error) {
      console.error("Failed to create goal", error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Delete this goal? This cannot be undone.")) return;
    try {
      await goalService.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error("Failed to delete goal", error);
    }
    setOpenMenuId(null);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditDesc(goal.description ?? "");
    setEditCategory((goal.category as GoalCategory) ?? "short-term");
    const istFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
    setEditDueDate(goal.targetDate ? istFmt.format(new Date(goal.targetDate)) : "");
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleEditSave = async () => {
    if (!editingGoal || !editTitle.trim()) return;
    try {
      await goalService.updateGoal(editingGoal.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        category: editCategory,
        dueDate: editDueDate || undefined,
      });
      fetchGoals();
      setShowEditModal(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Failed to update goal", error);
    }
  };

  if (loading) return <LoadingScreen message="Loading goals…" />;

  const showEmptyGoals = filtered.length === 0;

  return (
    <div className="goals-page">
      {/* ─ Header ─ */}
      <div className="goals-header">
        <div className="goals-header-left">
          <h1>My Goals</h1>
          <p className="goals-subtitle">
            Keep pushing! You're making progress on{" "}
            <strong>{activeCount} active goals</strong> this month.
          </p>
        </div>
        <div className="goals-header-right">
          <div className="goals-view-toggle">
            <button
              className={`goals-view-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={`goals-view-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              title="List view"
            >
              ≡
            </button>
          </div>
          <div className="goals-sort-wrapper" ref={sortRef}>
            <button
              className="goals-header-btn"
              onClick={() => setShowSortMenu((v) => !v)}
            >
              <span className="goals-header-btn-icon">↕</span> Sort
            </button>
            {showSortMenu && (
              <div className="goals-sort-menu">
                {(["date", "progress", "name"] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    className={`goals-sort-option${sort === key ? " active" : ""}`}
                    onClick={() => { setSort(key); setShowSortMenu(false); }}
                  >
                    {key === "date" ? "Due Date" : key === "progress" ? "Progress" : "Name"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─ Search + Tabs ─ */}
      <div className="goals-toolbar">
        <div className="goals-search">
          <span className="goals-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="goals-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`goals-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─ Grid / List ─ */}
      <div className={`goals-grid${view === "list" ? " goals-grid--list" : ""}`} ref={menuRef}>
        {showEmptyGoals && activeTab !== "all" ? (
          <div className="goals-empty-inline">
            <EmptyState
              icon="🎯"
              title={`No ${activeTab === "completed" ? "completed" : activeTab} goals`}
              description={
                activeTab === "completed"
                  ? "Complete a goal to see it here."
                  : "Create a goal to get started."
              }
              actionLabel="Create goal"
              onAction={() => setShowCreate(true)}
              compact
            />
          </div>
        ) : null}
        {showEmptyGoals && activeTab === "all" ? (
          <div className="goals-empty-full">
            <EmptyState
              icon="🎯"
              title="No goals yet"
              description="Set your first goal and break it down into tasks."
              actionLabel="Create your first goal"
              onAction={() => setShowCreate(true)}
            />
          </div>
        ) : null}
        {!showEmptyGoals && filtered.map((goal) => {
          const cat =
            CATEGORY_CONFIG[goal.category as GoalCategory] ||
            CATEGORY_CONFIG["short-term"];
          const isComplete = goal.progress >= 100;
          return (
            <div key={goal.id} className="goal-card-wrapper" style={{ position: "relative" }}>
              <Link
                to={`/goals/${goal.id}`}
                className="goal-card-link"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="goal-card">
                  <div className="goal-card-top">
                    <span
                      className="goal-category-badge"
                      style={{ background: cat.bg, color: cat.color }}
                    >
                      {cat.label}
                    </span>
                    <button
                      type="button"
                      className="goal-card-menu"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === goal.id ? null : goal.id);
                      }}
                    >
                      •••
                    </button>
                  </div>

                  <h3 className="goal-card-title">{goal.title}</h3>
                  <p className="goal-card-desc">{goal.description}</p>

                  <div className="goal-progress-section">
                    <div className="goal-progress-header">
                      <span className="goal-progress-label">Progress</span>
                      <span className={`goal-progress-value ${isComplete ? "complete" : ""}`}>
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="goal-progress-track">
                      <div
                        className={`goal-progress-fill ${isComplete ? "complete" : "default"}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="goal-card-footer">
                    <span className="goal-footer-item">
                      <span className="goal-footer-icon">📋</span>
                      {goal.tasks?.length || 0} Task
                      {(goal.tasks?.length || 0) !== 1 ? "s" : ""}
                    </span>
                    {goal.targetDate && (
                      <span className="goal-footer-item">
                        <span className="goal-footer-icon">📅</span>
                        {new Date(goal.targetDate).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Dropdown menu */}
              {openMenuId === goal.id && (
                <div className="goal-card-dropdown">
                  <button
                    className="goal-dropdown-item"
                    onClick={(e) => { e.stopPropagation(); openEdit(goal); }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="goal-dropdown-item goal-dropdown-item--danger"
                    onClick={(e) => { e.stopPropagation(); handleDelete(goal.id); }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {!showEmptyGoals && (
          <div className="goal-card-new" onClick={() => setShowCreate(true)}>
            <div className="goal-new-icon">+</div>
            <span className="goal-new-title">Create New Goal</span>
            <span className="goal-new-desc">Set your sights on something new.</span>
          </div>
        )}
      </div>

      {/* ─ Create Goal Modal ─ */}
      {showCreate && (
        <div className="goal-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h2>Create New Goal</h2>
              <button className="goal-modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="goal-modal-body">
              <label className="goal-form-label">
                Goal Title
                <input
                  type="text"
                  className="goal-form-input"
                  placeholder="e.g. Learn Machine Learning"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="goal-form-label">
                Description
                <textarea
                  className="goal-form-textarea"
                  placeholder="What do you want to achieve?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                />
              </label>
              <div className="goal-form-row">
                <label className="goal-form-label goal-form-half">
                  Category
                  <select
                    className="goal-form-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="goal-form-label goal-form-half">
                  Due Date
                  <input
                    type="date"
                    className="goal-form-input"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="goal-modal-footer">
              <button className="goal-btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="goal-btn-create" onClick={handleCreate} disabled={!newTitle.trim()}>
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─ Edit Goal Modal ─ */}
      {showEditModal && editingGoal && (
        <div className="goal-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h2>Edit Goal</h2>
              <button className="goal-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="goal-modal-body">
              <label className="goal-form-label">
                Goal Title
                <input
                  type="text"
                  className="goal-form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                />
              </label>
              <label className="goal-form-label">
                Description
                <textarea
                  className="goal-form-textarea"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
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
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>{opt.label}</option>
                    ))}
                  </select>
                </label>
                <label className="goal-form-label goal-form-half">
                  Due Date
                  <input
                    type="date"
                    className="goal-form-input"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="goal-modal-footer">
              <button className="goal-btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="goal-btn-create" onClick={handleEditSave} disabled={!editTitle.trim()}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
