import { useRegisterSW } from "virtual:pwa-register/react";
import "./UpdatePrompt.css";

const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="update-prompt">
      <span className="update-prompt-text">A new version is available</span>
      <button
        className="update-prompt-btn"
        onClick={() => updateServiceWorker(true)}
      >
        Update
      </button>
      <button
        className="update-prompt-dismiss"
        onClick={() => setNeedRefresh(false)}
      >
        ✕
      </button>
    </div>
  );
};

export default UpdatePrompt;
