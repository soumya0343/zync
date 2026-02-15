import "./TasksComponents.css";

const TasksBoardHeader = () => {
  return (
    <div className="tasks-board-header">
      <div className="tasks-header-left">
        <h1 className="tasks-board-title">Tasks Board</h1>
      </div>
      <div className="tasks-header-right">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Filter tasks..."
            className="search-input"
          />
        </div>
      </div>
    </div>
  );
};

export default TasksBoardHeader;
