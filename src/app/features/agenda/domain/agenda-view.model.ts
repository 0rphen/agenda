export type AgendaStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface PendingDelete {
  kind: 'task' | 'event';
  id: string;
  title: string;
}

export interface ListProgress {
  list: string;
  value: number;
}
