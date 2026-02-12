import "./TasksComponents.css";

const QuickAddBar = () => {
  return (
    <div className="quick-add-bar">
      <span className="quick-add-icon">+</span>
      <input
        type="text"
        className="quick-add-input"
        placeholder="Add a quick task to backlog..."
      />
    </div>
  );
};

export default QuickAddBar;
