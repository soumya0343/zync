import "./TasksComponents.css";

const TasksBoardHeader = () => {
  return (
    <div className="tasks-board-header">
      <div className="tasks-header-left">
        <h1 className="tasks-board-title">Tasks Board</h1>
        <div className="team-avatars">
          <div className="team-avatar" style={{ background: "#1a1a1a" }}></div>
          <div className="team-avatar" style={{ background: "#f59e0b" }}></div>
          <span className="team-more">+2</span>
        </div>
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
        <button className="notification-btn">🔔</button>
      </div>
    </div>
  );
};

export default TasksBoardHeader;
