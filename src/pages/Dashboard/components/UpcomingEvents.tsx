import "./DashboardComponents.css";

interface Event {
  id: string;
  title: string;
  time: string;
  type: string;
  day: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents = ({ events }: UpcomingEventsProps) => {
  return (
    <div className="widget-card upcoming-widget">
      <div className="widget-header">
        <span className="widget-subtitle">UPCOMING</span>
        <span className="widget-action">Calendar</span>
      </div>
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-item">
            <div className="event-date-box">
              <span className="event-day">{event.day}</span>
            </div>
            <div className="event-details">
              <h4>{event.title}</h4>
              <p>
                {event.time} • {event.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
