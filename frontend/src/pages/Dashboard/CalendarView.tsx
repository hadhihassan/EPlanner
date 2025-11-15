import { useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  type Event as RBCEvent,
} from "react-big-calendar";
import { parseISO, format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { IEvent } from "../../types/event.types";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse: (str: string) => parseISO(str),
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

interface CalendarEvent extends RBCEvent {
  id?: string;
  resource?: IEvent;
}

export default function CalendarView() {
  const { events } = useAppSelector((s) => s.events);
  const navigate = useNavigate();

  const eventsFormatted = useMemo<CalendarEvent[]>(() => {
    const rawEvents = events as unknown as IEvent[];

    return rawEvents.map((e) => {
      const start = new Date(e.startAt);
      const end = e.endAt
        ? new Date(e.endAt)
        : new Date(start.getTime() + 60 * 60 * 1000);

      return {
        id: e.id || e._id,
        title: e.title,
        start,
        end,
        resource: e,
      };
    });
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.id) {
      navigate(`/events/${event.id}`);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const now = new Date();
    const start = event.start instanceof Date ? event.start : new Date(event.start!);

    const isPast = start < now;
    const isToday = start.toDateString() === now.toDateString();

    let backgroundColor = "#3b82f6";
    if (isPast) backgroundColor = "#6b7280";
    else if (isToday) backgroundColor = "#10b981";

    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        cursor: "pointer",
      },
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Calendar View</h2>
        <p className="text-gray-600">
          View and manage your events on the calendar
        </p>
      </div>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={eventsFormatted}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          popup
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            agenda: "Agenda",
            date: "Date",
            time: "Time",
            event: "Event",
            noEventsInRange: "No events in this range",
          }}
        />
      </div>
    </motion.div>
  );
}
