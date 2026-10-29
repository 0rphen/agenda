export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «1 subtarea» / «3 subtareas» */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Accessible name of a nav item with a counter: «Tareas, 5 pendientes» */
export const countLabel = (item: {
  label: string;
  badge?: number;
  badgeLabel?: string | [string, string];
}) => {
  if (item.badge == null) return item.label;
  const words = item.badgeLabel ?? ['pendiente', 'pendientes'];
  const count = typeof words === 'string' ? `${item.badge} ${words}` : plural(item.badge, ...words);
  return `${item.label}, ${count}`;
};

/** Lowercase, no diacritics: «Reunión» → «reunion» */
export const normalizeSearch = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es');
