const TINTS = ['periwinkle', 'cream', 'rose', 'mint', 'sky', 'lilac', 'lime'];

// Algoritmos portados del bundle del DS: el mismo nombre da las mismas iniciales y tinte.
export function initials(name: string): string {
  const parts = (name || '?').trim().split(/\s+/);
  return (
    (parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')
  ).toUpperCase();
}

export function tintFor(name: string): string {
  let n = 0;
  for (let i = 0; i < name.length; i++) n = (n + name.charCodeAt(i)) % 997;
  return TINTS[n % TINTS.length];
}
