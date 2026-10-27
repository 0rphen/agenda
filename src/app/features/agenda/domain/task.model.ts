import { Subtask } from '@shared/interfaces';
import { Category } from '@shared/types';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  due?: string; // YYYY-MM-DD
  list?: string;
  listColor?: Category;
  notes?: string;
  priority?: string;
  tags?: string[];
  subtasks?: Subtask[];
}
