import "./EmptyState.css";

export interface EmptyStateProps {
  /** Icon or emoji (e.g. "📋", "🎯") or leave empty for default */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Optional primary action (e.g. "Add task", "Create goal") */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional secondary action */
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Compact style for inline/section use */
  compact?: boolean;
}

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
}: EmptyStateProps) => {
  return (
    <div className={`empty-state ${compact ? "empty-state--compact" : ""}`}>
      {icon != null && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      <div className="empty-state-actions">
        {actionLabel && onAction && (
          <button
            type="button"
            className="empty-state-btn empty-state-btn--primary"
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
        {secondaryLabel && onSecondary && (
          <button
            type="button"
            className="empty-state-btn empty-state-btn--secondary"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
