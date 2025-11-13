import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parseISO, format, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAppSelector } from '../../store/hooks';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse: (str) => parseISO(str), startOfWeek: () => startOfWeek(new Date()), getDay, locales });

export default function CalendarView() {
  const { events } = useAppSelector(s => s.events);
  const eventsFormatted = useMemo(() => (events || []).map((e:any) => ({
    id: e._id,
    title: e.title,
    start: new Date(e.startAt),
    end: e.endAt ? new Date(e.endAt) : new Date(new Date(e.startAt).getTime() + 60*60*1000)
  })), [events]);

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Calendar</h2>
      <Calendar localizer={localizer} events={eventsFormatted} startAccessor="start" endAccessor="end" style={{ height: 600 }} />
    </div>
  );
}
