export type SidebarNavItem = {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  /** Words for the counter in the accessible name; «pendiente(s)» by default */
  badgeLabel?: string | [string, string];
  disabled?: boolean;
};

export type SidebarNavEntry = SidebarNavItem | { section: string };
