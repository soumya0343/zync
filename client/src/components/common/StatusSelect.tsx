import { useState, useRef, useEffect } from "react";
import "./StatusSelect.css";

interface StatusSelectProps {
  currentStatus: string;
  columns: any[];
  onChange: (columnId: string) => void;
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: "#6b7280",
  backlog: "#6b7280",
  "in-progress": "#8b5cf6",
  done: "#16a34a",
  blocked: "#ef4444",
  planned: "#f59e0b",
};

const StatusSelect = ({
  currentStatus,
  columns,
  onChange,
  className = "",
}: StatusSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize status string
  const normalizedStatus = currentStatus.toLowerCase().replace(" ", "-");
  const statusColor = STATUS_COLORS[normalizedStatus] || "#6b7280";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`status-select-container ${className}`} ref={containerRef}>
      <div
        className="status-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: isOpen ? statusColor : "transparent" }}
      >
        <span className="status-dot" style={{ background: statusColor }}></span>
        <span className="status-label">
          {currentStatus.toUpperCase().replace("-", " ")}
        </span>
        <span className="status-chevron">›</span>
      </div>

      {isOpen && (
        <div className="status-dropdown">
          {columns.map((col) => {
            const lowerTitle = col.title.toLowerCase().replace(" ", "-");
            const colColor = STATUS_COLORS[lowerTitle] || "#6b7280";
            return (
              <div
                key={col.id}
                className="status-option"
                onClick={() => {
                  onChange(col.id);
                  setIsOpen(false);
                }}
              >
                <span
                  className="status-option-dot"
                  style={{ background: colColor }}
                ></span>
                {col.title}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StatusSelect;
