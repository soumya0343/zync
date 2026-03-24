import "./TasksComponents.css";

interface TasksBoardHeaderProps {
  filterText: string;
  onFilterChange: (value: string) => void;
  priorityFilter: number | null;
  onPriorityChange: (value: number | null) => void;
  view: "board" | "list";
  onViewChange: (view: "board" | "list") => void;
}

const PRIORITY_CHIPS: { label: string; value: number | null }[] = [
  { label: "All", value: null },
  { label: "P0", value: 0 },
  { label: "P1", value: 1 },
  { label: "P2", value: 2 },
  { label: "P3", value: 3 },
];

const TasksBoardHeader = ({
  filterText,
  onFilterChange,
  priorityFilter,
  onPriorityChange,
  view,
  onViewChange,
}: TasksBoardHeaderProps) => {
  return (
    <div className="tasks-board-header-wrapper">
      <div className="tasks-board-header">
        <div className="tasks-header-left">
          <h1 className="tasks-board-title">Tasks Board</h1>
        </div>
        <div className="tasks-header-right">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn${view === "board" ? " active" : ""}`}
              onClick={() => onViewChange("board")}
            >
              Board
            </button>
            <button
              className={`view-toggle-btn${view === "list" ? " active" : ""}`}
              onClick={() => onViewChange("list")}
            >
              List
            </button>
          </div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Filter tasks..."
              className="search-input"
              value={filterText}
              onChange={(e) => onFilterChange(e.target.value)}
            />
            {filterText && (
              <button
                className="search-clear-btn"
                onClick={() => onFilterChange("")}
                aria-label="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="filter-chips-row">
        <span className="filter-chip-label">Priority:</span>
        <div className="filter-chip-group">
          {PRIORITY_CHIPS.map((chip) => (
            <button
              key={String(chip.value)}
              className={`filter-chip${priorityFilter === chip.value ? " active" : ""}`}
              onClick={() => onPriorityChange(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TasksBoardHeader;
