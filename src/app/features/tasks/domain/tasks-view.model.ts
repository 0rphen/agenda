import { Task } from '../../agenda/domain/task.model';

export type TaskFilter = 'todas' | 'hoy' | 'pendientes' | 'hechas';

export type TaskGroupKey = 'late' | 'today' | 'next' | 'done';

export interface TaskGroup {
  key: TaskGroupKey;
  heading: string;
  tasks: Task[];
}

export interface TasksProgress {
  done: number;
  total: number;
  value: number;
}
