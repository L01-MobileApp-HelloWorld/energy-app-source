/**
 * Interface for score category grouping in result screen.
 */
export interface ICategory {
  label: string;
  indices: number[];
}

/**
 * Sort options for history screen.
 */
export type ISortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
