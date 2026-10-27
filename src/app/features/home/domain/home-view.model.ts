import { CalendarEvent } from '../../agenda/domain/calendar-event.model';

export type AgendaRange = 'day' | 'week' | 'next';

export interface AgendaGroup {
  day: string;
  title: string;
  events: CalendarEvent[];
}
