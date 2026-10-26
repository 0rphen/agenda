export interface Subtask {
  title: string;
  done: boolean;
}

export interface TaskFormValue {
  title: string;
  notes: string;
  list: string;
  /** YYYY-MM-DD or '' */
  due: string;
  /** 'baja' | 'media' | 'alta' */
  priority: string;
  tags: string[];
  subtasks: Subtask[];
}
