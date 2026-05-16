import { IStateKey } from './IStateInfo';

/**
 * Interface for a single history entry (quiz result).
 * Used in history screen and entry-card component.
 */
export interface IHistoryEntry {
  id: string;
  time: string;
  title: string;
  states: IStateKey[];
  rating: number;
  resultData: {
    stateKey: IStateKey;
    overall: number;
    categoryScores: number[];
  };
  surveyAnswers: Record<number, number>;
}

/**
 * Interface for a grouped history section (e.g., "HÔM NAY", "HÔM QUA").
 */
export interface IHistorySection {
  label: string;
  entries: IHistoryEntry[];
}
