export interface NavDestination {
  icon: string;
  label: string;
  /** Destino al pulsar. */
  url: string;
  /** Prefijos de URL que lo marcan activo. */
  match: string[];
}
