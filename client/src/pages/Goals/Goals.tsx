import { useState, useCallback, useEffect } from "react";
import { goalService } from "../../services/goalService";
import { CATEGORY_CONFIG } from "./goalData";
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
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filtered = goals.filter((g) => {
    if (activeTab !== "all" && g.category !== activeTab) return false;
    if (search && !g.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const activeCount = goals.filter((g) => g.category !== "completed").length;

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

  if (loading) return <div className="goals-page">Loading...</div>;

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
          const cat =
            CATEGORY_CONFIG[goal.category as GoalCategory] ||
            CATEGORY_CONFIG["short-term"];
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
                  {goal.tasks?.length || 0} Task
                  {(goal.tasks?.length || 0) !== 1 ? "s" : ""}
                </span>
                {goal.dueDate && (
                  <span className="goal-footer-item">
                    <span className="goal-footer-icon">📅</span>
                    {new Date(goal.dueDate).toLocaleDateString()}
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
                    type="date"
                    className="goal-form-input"
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
