import { Category, Tint } from '@shared/types';

export interface WeekViewEvent {
  day: string;
  start: string;
  end: string;
  title: string;
  tint?: Tint;
  selected?: boolean;
  cancelled?: boolean;
  state?: 'hover' | 'focus';
}

export interface WeekViewAllDay {
  day: string;
  title: string;
  category?: Category;
}
