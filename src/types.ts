export type DiffOptions = {
  /**
   * Keys to exclude from the diff.
   * Supports dot notation for nested keys (e.g., "user.password").
   */
  exclude?: string[];
  /**
   * Custom formatters for specific types or keys.
   */
  formatters?: Record<string, Formatter>;
  /**
   * Language to use for the human-readable output.
   * Defaults to 'en'.
   */
  lang?: 'en' | 'ko';
};

export type Formatter = (value: any) => string;

export type LanguageMap = {
  changed: string; // "{key} changed from {from} to {to}"
  added: string; // "{key} added with value {value}"
  removed: string; // "{key} removed (was {value})"
  arrayAdded: string; // "{key} added item {value}"
  arrayRemoved: string; // "{key} removed item {value}"
};
