export type AgendaStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ListProgress {
  list: string;
  value: number;
}
