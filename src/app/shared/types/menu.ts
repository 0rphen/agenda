export type MenuItem = {
  label: string;
  icon?: string;
  shortcut?: string;
  tone?: 'danger';
  disabled?: boolean;
  selected?: boolean;
};

export type MenuEntry = MenuItem | { divider: true } | { section: string };
