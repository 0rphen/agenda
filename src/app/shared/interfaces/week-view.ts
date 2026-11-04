import { Category, Tint } from '@shared/types';

export interface WeekViewEvent {
  id?: string;
  day: string;
  start: string;
  end: string;
  title: string;
  tint?: Tint;
  selected?: boolean;
  cancelled?: boolean;
}

/** Clicked empty hour: `day` is `YYYY-MM-DD`, `hour` is `HH:00`. */
export interface WeekViewSlot {
  day: string;
  hour: string;
}

export interface WeekViewAllDay {
  day: string;
  title: string;
  category?: Category;
}
