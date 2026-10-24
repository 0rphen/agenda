export type SidebarNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  disabled?: boolean;
  state?: 'hover' | 'active' | 'focus';
};

export type SidebarNavEntry = SidebarNavItem | { section: string };
