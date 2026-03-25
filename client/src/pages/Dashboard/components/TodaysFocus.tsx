import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Task } from "../../../types";
import TaskItem from "./TaskItem";
import EmptyState from "../../../components/common/EmptyState";
import { taskService } from "../../../services/taskService";
import "./DashboardComponents.css";

interface TodaysFocusProps {
  tasks: Task[];
}

const TodaysFocus = ({ tasks: initialTasks }: TodaysFocusProps) => {
  const navigate = useNavigate();
  const [tasks] = useState<Task[]>(initialTasks);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const handleToggleComplete = async (taskId: string) => {
    if (loading.has(taskId)) return;
    const isCompleted = completed.has(taskId);
    setCompleted((prev) => {
      const next = new Set(prev);
      isCompleted ? next.delete(taskId) : next.add(taskId);
      return next;
    });
    setLoading((prev) => new Set(prev).add(taskId));
    try {
      await taskService.completeTask(taskId);
    } catch (e) {
      console.error("Failed to complete task", e);
      // revert on error
      setCompleted((prev) => {
        const next = new Set(prev);
        isCompleted ? next.add(taskId) : next.delete(taskId);
        return next;
      });
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const isEmpty = !tasks?.length;

  return (
    <div className="section-container">
      <div className="section-header">
        <div className="section-title">
          <span className="icon-sun">☀️</span> Today's Focus
        </div>
        <button className="btn-link" onClick={() => navigate("/tasks")}>
          View All Tasks
        </button>
      </div>
      {isEmpty ? (
        <EmptyState
          icon="☀️"
          title="Nothing for today"
          description="Add tasks and prioritize to see them here."
          actionLabel="View tasks"
          onAction={() => navigate("/tasks")}
          compact
        />
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onClick={(taskId) => navigate(`/tasks/${taskId}`)}
              completed={completed.has(task.id)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaysFocus;
