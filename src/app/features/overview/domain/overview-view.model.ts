export interface OverviewStats {
  eventsToday: number;
  nextStart?: string;
  pending: number;
  dueToday: number;
  reservedHours: string; // «6,3 h»
  completed: number;
  planned: number;
}

export interface AgendaConflict {
  time: string;
  first: string;
  second: string;
}
