const QUOTABLE_API = "https://api.quotable.io";
const CACHE_KEY = "zync_daily_quote";
const CACHE_DATE_KEY = "zync_daily_quote_date";

export interface Quote {
  content: string;
  author: string;
}

function getDateKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getCachedQuote(): Quote | null {
  try {
    const dateKey = localStorage.getItem(CACHE_DATE_KEY);
    if (dateKey !== getDateKey()) return null;
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Quote;
  } catch {
    return null;
  }
}

function setCachedQuote(quote: Quote): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(quote));
    localStorage.setItem(CACHE_DATE_KEY, getDateKey());
  } catch {
    // ignore
  }
}

/**
 * Fetches a daily quote from Quotable (free public API).
 * Caches the quote in localStorage for the current day so the same quote is shown until tomorrow.
 */
export async function getDailyQuote(): Promise<Quote> {
  const cached = getCachedQuote();
  if (cached) return cached;

  const response = await fetch(`${QUOTABLE_API}/random`);
  if (!response.ok) throw new Error("Failed to fetch quote");

  const data = (await response.json()) as { content: string; author: string };
  const quote: Quote = { content: data.content, author: data.author };
  setCachedQuote(quote);
  return quote;
}
