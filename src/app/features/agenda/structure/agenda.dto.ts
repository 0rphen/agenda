import { Category, Tint } from '@shared/types';

export interface CalendarEventDto {
  id: string;
  title: string;
  date: string;
  start?: string;
  end?: string;
  all_day: boolean;
  category?: Category;
  category_label?: string;
  tint?: Tint;
  location?: string;
  people: string[];
  confirmed: boolean;
}

export interface TaskDto {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  list?: string;
  list_color?: Category;
  subtasks?: number;
}
