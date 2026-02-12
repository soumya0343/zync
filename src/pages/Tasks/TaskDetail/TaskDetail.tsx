import { useParams } from "react-router-dom";
import "./TaskDetail.css";

const TaskDetail = () => {
  const { taskId } = useParams<{ taskId: string }>();

  return (
    <div className="task-detail-page">
      <h1>Task Detail</h1>
      <p>
        Viewing task: <strong>{taskId}</strong>
      </p>
    </div>
  );
};

export default TaskDetail;
