import { useState, useEffect } from "react";
import { getDailyQuote } from "../../../services/quoteService";
import "./DashboardComponents.css";

const FALLBACK_QUOTE = {
  content: "The only way to do great work is to love what you do.",
  author: "Steve Jobs",
};

const QuoteWidget = () => {
  const [quote, setQuote] = useState(FALLBACK_QUOTE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyQuote()
      .then((q) => setQuote(q))
      .catch(() => {
        // keep fallback
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="widget-card quote-widget">
      <div className="quote-icon">💡</div>
      {loading ? (
        <p className="quote-text">Loading today’s quote…</p>
      ) : (
        <>
          <p className="quote-text">"{quote.content}"</p>
          <p className="quote-author">— {quote.author.toUpperCase()}</p>
        </>
      )}
    </div>
  );
};

export default QuoteWidget;
