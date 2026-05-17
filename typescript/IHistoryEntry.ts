import { IStateKey } from './IStateInfo';

/**
 * Interface for a single history entry (quiz result).
 * Used in history screen and entry-card component.
 */
export interface IHistoryEntry {
  id: string;
  createdAt: string;
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
