import { useState, useCallback, useEffect } from "react";
import { getAllGoals, CATEGORY_CONFIG, addGoal } from "./goalData";
import type { GoalCategory } from "./goalData";
import "./Goals.css";

type TabFilter = "all" | GoalCategory;

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
  const [showCreate, setShowCreate] = useState(false);
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate((n) => n + 1), []);

  // Listen for sidebar "+ New Goal" button
  useEffect(() => {
    const handler = () => setShowCreate(true);
    window.addEventListener("open-new-goal", handler);
    return () => window.removeEventListener("open-new-goal", handler);
  }, []);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("short-term");
  const [newDueDate, setNewDueDate] = useState("");

  const goals = getAllGoals();

  const filtered = goals.filter((g) => {
    if (activeTab !== "all" && g.category !== activeTab) return false;
    if (search && !g.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const activeCount = goals.filter((g) => g.category !== "completed").length;

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    addGoal(
      newTitle.trim(),
      newDesc.trim() || "No description yet.",
      newCategory,
      newDueDate || undefined,
    );
    setNewTitle("");
    setNewDesc("");
    setNewCategory("short-term");
    setNewDueDate("");
    setShowCreate(false);
    rerender();
  };

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
          <button className="goals-header-btn">
            <span className="goals-header-btn-icon">☰</span> Filter
          </button>
          <button className="goals-header-btn">
            <span className="goals-header-btn-icon">↕</span> Sort
          </button>
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

      {/* ─ Grid ─ */}
      <div className="goals-grid">
        {filtered.map((goal) => {
          const cat = CATEGORY_CONFIG[goal.category];
          const isComplete = goal.progress >= 100;
          return (
            <div className="goal-card" key={goal.id}>
              <div className="goal-card-top">
                <span
                  className="goal-category-badge"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.label}
                </span>
                <button className="goal-card-menu">•••</button>
              </div>

              <h3 className="goal-card-title">{goal.title}</h3>
              <p className="goal-card-desc">{goal.description}</p>

              {/* Progress */}
              <div className="goal-progress-section">
                <div className="goal-progress-header">
                  <span className="goal-progress-label">Progress</span>
                  <span
                    className={`goal-progress-value ${isComplete ? "complete" : ""}`}
                  >
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

              {/* Footer */}
              <div className="goal-card-footer">
                <span className="goal-footer-item">
                  <span className="goal-footer-icon">📋</span>
                  {goal.taskIds.length} Task
                  {goal.taskIds.length !== 1 ? "s" : ""}
                </span>
                {goal.dueLabel && (
                  <span
                    className={`goal-footer-item ${goal.dueSeverity || ""}`}
                  >
                    {goal.dueSeverity === "urgent" && (
                      <span className="goal-footer-icon">⚠</span>
                    )}
                    {goal.dueSeverity === "done" && (
                      <span className="goal-footer-icon">✅</span>
                    )}
                    {goal.dueLabel}
                  </span>
                )}
                {!goal.dueLabel && goal.dueDate && (
                  <span className="goal-footer-item">
                    <span className="goal-footer-icon">📅</span>
                    {goal.dueDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* + Create New Goal card */}
        <div className="goal-card-new" onClick={() => setShowCreate(true)}>
          <div className="goal-new-icon">+</div>
          <span className="goal-new-title">Create New Goal</span>
          <span className="goal-new-desc">
            Set your sights on something new.
          </span>
        </div>
      </div>

      {/* ─ Create Goal Modal ─ */}
      {showCreate && (
        <div
          className="goal-modal-overlay"
          onClick={() => setShowCreate(false)}
        >
          <div className="goal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="goal-modal-header">
              <h2>Create New Goal</h2>
              <button
                className="goal-modal-close"
                onClick={() => setShowCreate(false)}
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
                    onChange={(e) =>
                      setNewCategory(e.target.value as GoalCategory)
                    }
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="goal-form-label goal-form-half">
                  Due Date
                  <input
                    type="text"
                    className="goal-form-input"
                    placeholder="e.g. Mar 31, 2024"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="goal-modal-footer">
              <button
                className="goal-btn-cancel"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                className="goal-btn-create"
                onClick={handleCreate}
                disabled={!newTitle.trim()}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
