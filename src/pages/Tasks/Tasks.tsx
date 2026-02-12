import { useNavigate } from "react-router-dom";
import TasksBoardHeader from "./components/TasksBoardHeader";
import QuickAddBar from "./components/QuickAddBar";
import KanbanColumn from "./components/KanbanColumn";
import { KANBAN_COLUMNS } from "./mockData";
import "./Tasks.css";

const Tasks = () => {
  const navigate = useNavigate();

  const handleCardClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <div className="tasks-page">
      <TasksBoardHeader />
      <QuickAddBar />
      <div className="kanban-board">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            title={col.title}
            count={col.count}
            color={col.color}
            tasks={col.tasks}
            showAddButton={col.id === "backlog"}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Tasks;
