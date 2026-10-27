import { Category, Tint } from '@shared/types';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start?: string; // HH:MM; sin start = todo el día
  end?: string;
  category?: Category;
  categoryLabel?: string;
  tint?: Tint;
  location?: string;
  people: string[];
  confirmed: boolean;
  notes?: string;
  reminder?: string;
  repeat?: string;
}
