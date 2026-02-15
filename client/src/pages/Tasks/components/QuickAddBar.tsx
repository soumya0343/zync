import { useState, useRef } from "react";
import "./TasksComponents.css";

interface QuickAddBarProps {
  onAddTask?: (title: string) => void;
}

const QuickAddBar = ({ onAddTask }: QuickAddBarProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for sidebar "New Task" button
  // Listen for sidebar "New Task" button - REMOVED to use Modal instead
  // useEffect(() => {
  //   const handler = () => inputRef.current?.focus();
  //   window.addEventListener("open-new-task", handler);
  //   return () => window.removeEventListener("open-new-task", handler);
  // }, []);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onAddTask?.(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="quick-add-bar">
      <span className="quick-add-icon">+</span>
      <input
        ref={inputRef}
        type="text"
        className="quick-add-input"
        placeholder="Add a quick task to backlog..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value.trim() && (
        <button className="quick-add-btn" onClick={handleSubmit}>
          Add
        </button>
      )}
    </div>
  );
};

export default QuickAddBar;
