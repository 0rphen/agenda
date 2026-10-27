export type BottomNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  /** Words for the counter in the accessible name; «pendiente(s)» by default */
  badgeLabel?: string | [string, string];
  disabled?: boolean;
  state?: 'hover' | 'active' | 'focus';
};
