import React from "react";
import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  onSuffixClick?: () => void;
  labelRight?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  suffix,
  onSuffixClick,
  labelRight,
  className = "",
  id,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className={`input-wrapper ${className}`}>
      {(label || labelRight) && (
        <div className="input-label-row">
          {label && (
            <label htmlFor={inputId} className="input-label">
              {label}
            </label>
          )}
          {labelRight && <div className="input-label-right">{labelRight}</div>}
        </div>
      )}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          className={`input-field ${error ? "input-error" : ""} ${icon ? "input-with-icon" : ""} ${suffix ? "input-with-suffix" : ""}`}
          {...props}
        />
        {suffix && (
          <span
            className={`input-suffix ${onSuffixClick ? "clickable" : ""}`}
            onClick={onSuffixClick}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
