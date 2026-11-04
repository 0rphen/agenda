import { Category, Tint } from '@shared/types';

export interface DayViewEvent {
  id?: string;
  start: string;
  end: string;
  title: string;
  tint?: Tint;
  category?: string;
  location?: string;
  locationIcon?: string;
  people?: string[];
  selected?: boolean;
  cancelled?: boolean;
}

export interface DayViewAllDay {
  title: string;
  category?: Category;
}

export interface Placed<T> {
  event: T;
  start: number;
  end: number;
  lane: number;
  lanes: number;
}
