export type BottomNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  state?: 'hover' | 'active' | 'focus';
};
