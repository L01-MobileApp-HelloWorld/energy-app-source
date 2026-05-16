/**
 * State keys representing the user's energy/mental state.
 * Maps to backend state values.
 */
export type IStateKey =
  | 'exhausted'
  | 'tired'
  | 'lazy'
  | 'ready'
  | 'focused'
  | 'unmotivated';

/**
 * Interface for state information displayed on the result screen.
 */
export interface IStateInfo {
  emoji: string;
  title: string;
  summary: string;
  tips: string[];
}
