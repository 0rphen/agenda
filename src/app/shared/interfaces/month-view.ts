import { Category } from '@shared/types';

export interface MonthViewEvent {
  day: string;
  title: string;
  start?: string;
  category?: Category;
  cancelled?: boolean;
  state?: 'hover' | 'focus';
}

export interface MonthViewDay {
  iso: string;
  num: number;
  out: boolean;
  today: boolean;
  label: string;
  events: MonthViewEvent[];
  more: number;
}
