export interface EventFormValue {
  title: string;
  category: string;
  /** YYYY-MM-DD or '' */
  date: string;
  /** HH:MM */
  start: string;
  /** HH:MM */
  end: string;
  allDay: boolean;
  location: string;
  people: string;
  notes: string;
  reminder: string;
  repeat: string;
}
