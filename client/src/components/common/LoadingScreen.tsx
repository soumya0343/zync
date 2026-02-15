import "./LoadingScreen.css";

interface LoadingScreenProps {
  /** Optional short message below the spinner */
  message?: string;
}

const LoadingScreen = ({ message }: LoadingScreenProps) => {
  return (
    <div className="loading-screen">
      <div className="loading-screen-spinner" aria-hidden="true" />
      {message && <p className="loading-screen-message">{message}</p>}
    </div>
  );
};

export default LoadingScreen;
