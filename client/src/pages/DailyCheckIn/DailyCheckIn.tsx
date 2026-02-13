import { useState } from "react";
import "./DailyCheckIn.css";

const MOODS = [
  { emoji: "😣", label: "Terrible" },
  { emoji: "🙁", label: "Bad" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😄", label: "Great" },
];

// Mock history data
const HISTORY = [
  {
    date: "Thu, Feb 12",
    workLog:
      "Finished Goals page implementation, linked tasks to goals, built create modal.",
    hours: 6.5,
    mood: 4,
    reflections: "Great progress today! Need to test edge cases tomorrow.",
    completed: true,
  },
  {
    date: "Wed, Feb 11",
    workLog:
      "Implemented Task Detail page with recursive navigation and priority view.",
    hours: 7,
    mood: 3,
    reflections: "The recursive navigation was tricky but works well now.",
    completed: true,
  },
  {
    date: "Tue, Feb 10",
    workLog:
      "Built the Kanban board with drag indicators and task detail drawer.",
    hours: 5,
    mood: 3,
    reflections: "Need to improve the drawer animation smoothness.",
    completed: true,
  },
  {
    date: "Mon, Feb 9",
    workLog: "Set up project structure, dashboard layout, and design system.",
    hours: 4,
    mood: 2,
    reflections: "Slow start but the foundation is solid.",
    completed: true,
  },
  {
    date: "Sun, Feb 8",
    workLog: "Researched design patterns and collected Figma references.",
    hours: 2.5,
    mood: 3,
    reflections: "",
    completed: true,
  },
];

const DailyCheckIn = () => {
  const [workLog, setWorkLog] = useState("");
  const [hours, setHours] = useState(4.5);
  const [mood, setMood] = useState(3);
  const [reflections, setReflections] = useState("");
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewEntry, setViewEntry] = useState<(typeof HISTORY)[number] | null>(
    null,
  );

  const handleSaveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleComplete = () => {
    setSaved(true);
  };

  // Format date like "WEDNESDAY, OCT 24"
  const now = new Date();
  const dayName = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const month = now
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = now.getDate();

  // ─── Read-only detail view of a past check-in ────────────
  if (viewEntry) {
    return (
      <div className="checkin-page">
        <div className="checkin-header">
          <div className="checkin-header-left">
            <p className="checkin-date">📅 {viewEntry.date.toUpperCase()}</p>
            <h1 className="checkin-title">Daily Check-In</h1>
          </div>
          <button
            className="checkin-history-btn"
            onClick={() => setViewEntry(null)}
          >
            ← Back
          </button>
        </div>

        <div className="checkin-card checkin-card-readonly">
          {/* Work log */}
          <div className="checkin-section">
            <h3 className="checkin-section-heading">
              <span className="checkin-section-icon">✅</span>
              What did you work on today?
            </h3>
            <div className="checkin-readonly-block">{viewEntry.workLog}</div>
          </div>

          {/* Metrics */}
          <div className="checkin-metrics">
            <div className="checkin-metric-block">
              <h3 className="checkin-section-heading">
                <span className="checkin-section-icon">⏱</span>
                Focused Hours
                <span className="checkin-hours-badge">
                  {viewEntry.hours} hrs
                </span>
              </h3>
              <div className="checkin-slider-wrap">
                <input
                  type="range"
                  className="checkin-slider"
                  min={0}
                  max={12}
                  step={0.5}
                  value={viewEntry.hours}
                  disabled
                />
                <div className="checkin-slider-labels">
                  <span>0H</span>
                  <span>4H</span>
                  <span>8H</span>
                  <span>12H+</span>
                </div>
              </div>
            </div>

            <div className="checkin-metric-block">
              <h3 className="checkin-section-heading">
                <span className="checkin-section-icon">😊</span>
                Mood
              </h3>
              <div className="checkin-mood-row">
                {MOODS.map((m, i) => (
                  <span
                    key={i}
                    className={`checkin-mood-btn ${viewEntry.mood === i ? "active" : ""}`}
                    title={m.label}
                  >
                    {m.emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reflections */}
          <div className="checkin-section">
            <h3 className="checkin-section-heading">
              <span className="checkin-section-icon">👁</span>
              Reflections / Blockers
            </h3>
            <div className="checkin-readonly-block">
              {viewEntry.reflections || "No reflections recorded."}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="checkin-footer">
          <div className="checkin-autosave">
            <span className="checkin-autosave-dot saved"></span>
            <span className="checkin-autosave-text">Completed check-in</span>
          </div>
          <div className="checkin-footer-actions">
            <button
              className="checkin-btn-draft"
              onClick={() => {
                setViewEntry(null);
                setShowHistory(true);
              }}
            >
              ← All History
            </button>
          </div>
        </div>

        <p className="checkin-quote">"Small progress is still progress."</p>
      </div>
    );
  }

  // ─── Normal editable check-in form ───────────────────────
  return (
    <div className="checkin-page">
      {/* Header */}
      <div className="checkin-header">
        <div className="checkin-header-left">
          <p className="checkin-date">
            📅 {dayName}, {month} {day}
          </p>
          <h1 className="checkin-title">Daily Check-In</h1>
        </div>
        <button
          className="checkin-history-btn"
          onClick={() => setShowHistory(true)}
        >
          📋 View History
        </button>
      </div>

      {/* Card container */}
      <div className="checkin-card">
        {/* Section 1: Work log */}
        <div className="checkin-section">
          <h3 className="checkin-section-heading">
            <span className="checkin-section-icon">✅</span>
            What did you work on today?
          </h3>
          <textarea
            className="checkin-textarea"
            placeholder="Briefly describe your main tasks and achievements..."
            value={workLog}
            onChange={(e) => setWorkLog(e.target.value)}
            rows={4}
          />
        </div>

        {/* Section 2: Focused Hours + Mood */}
        <div className="checkin-metrics">
          <div className="checkin-metric-block">
            <h3 className="checkin-section-heading">
              <span className="checkin-section-icon">⏱</span>
              Focused Hours
              <span className="checkin-hours-badge">{hours} hrs</span>
            </h3>
            <div className="checkin-slider-wrap">
              <input
                type="range"
                className="checkin-slider"
                min={0}
                max={12}
                step={0.5}
                value={hours}
                onChange={(e) => setHours(parseFloat(e.target.value))}
              />
              <div className="checkin-slider-labels">
                <span>0H</span>
                <span>4H</span>
                <span>8H</span>
                <span>12H+</span>
              </div>
            </div>
          </div>

          <div className="checkin-metric-block">
            <h3 className="checkin-section-heading">
              <span className="checkin-section-icon">😊</span>
              Mood
            </h3>
            <div className="checkin-mood-row">
              {MOODS.map((m, i) => (
                <button
                  key={i}
                  className={`checkin-mood-btn ${mood === i ? "active" : ""}`}
                  onClick={() => setMood(i)}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Reflections */}
        <div className="checkin-section">
          <h3 className="checkin-section-heading">
            <span className="checkin-section-icon">👁</span>
            Reflections / Blockers
          </h3>
          <textarea
            className="checkin-textarea"
            placeholder="Any obstacles? Thoughts for tomorrow?"
            value={reflections}
            onChange={(e) => setReflections(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="checkin-footer">
        <div className="checkin-autosave">
          <span
            className={`checkin-autosave-dot ${saved ? "saved" : ""}`}
          ></span>
          <span className="checkin-autosave-text">
            {saved ? "Saved!" : "Changes auto-saved"}
          </span>
        </div>
        <div className="checkin-footer-actions">
          <button className="checkin-btn-draft" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button className="checkin-btn-complete" onClick={handleComplete}>
            Complete Check-In →
          </button>
        </div>
      </div>

      {/* Quote */}
      <p className="checkin-quote">"Small progress is still progress."</p>

      {/* ─── History Drawer ──────────────────────────────────── */}
      {showHistory && (
        <div className="history-overlay" onClick={() => setShowHistory(false)}>
          <div className="history-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="history-drawer-header">
              <h2>Check-In History</h2>
              <button
                className="history-close"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>

            <div className="history-list">
              {HISTORY.map((entry, i) => (
                <div
                  className="history-entry"
                  key={i}
                  onClick={() => {
                    setViewEntry(entry);
                    setShowHistory(false);
                  }}
                >
                  <div className="history-entry-top">
                    <span className="history-entry-date">{entry.date}</span>
                    <div className="history-entry-meta">
                      <span className="history-entry-hours">
                        ⏱ {entry.hours}h
                      </span>
                      <span className="history-entry-mood">
                        {MOODS[entry.mood].emoji}
                      </span>
                      {entry.completed && (
                        <span className="history-entry-badge">✓ Done</span>
                      )}
                    </div>
                  </div>
                  <p className="history-entry-work">{entry.workLog}</p>
                  {entry.reflections && (
                    <p className="history-entry-reflection">
                      💭 {entry.reflections}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="history-drawer-footer">
              <span className="history-streak">🔥 5-day streak</span>
              <span className="history-avg">Avg: 5.0 hrs / day</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyCheckIn;
