import "./DashboardComponents.css";

const QuoteWidget = () => {
  return (
    <div className="widget-card quote-widget">
      <div className="quote-icon">💡</div>
      <p className="quote-text">
        "The only way to do great work is to love what you do."
      </p>
      <p className="quote-author">— STEVE JOBS</p>
    </div>
  );
};

export default QuoteWidget;
