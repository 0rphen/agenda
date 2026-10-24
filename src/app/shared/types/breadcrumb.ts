export type BreadcrumbItem = { label: string; icon?: string } & (
  | { link: string | readonly unknown[]; href?: never }
  | { href: string; link?: never }
  | { link?: never; href?: never }
);
