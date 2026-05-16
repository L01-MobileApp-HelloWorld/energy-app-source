import { ISurveyOption } from './ISurveyOption';

/**
 * Backend group categories for scoring algorithm.
 */
export type BackendGroup = 'energy' | 'work' | 'psychology' | 'environment';

/**
 * Interface for a survey question.
 * Each question belongs to a backend scoring group and contains multiple options.
 */
export interface IQuestion {
  id: number;
  category: string;
  categoryEmoji: string;
  question: string;
  options: ISurveyOption[];
  group: BackendGroup;
}
