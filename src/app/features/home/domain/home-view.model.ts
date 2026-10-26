import { CalendarEvent } from './calendar-event.model';

export type AgendaRange = 'day' | 'week' | 'next';
export type AgendaStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AgendaGroup {
  day: string;
  title: string;
  events: CalendarEvent[];
}

export interface ListProgress {
  list: string;
  value: number;
}
