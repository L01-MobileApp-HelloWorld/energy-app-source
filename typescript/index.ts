/**
 * Central barrel export for all TypeScript interfaces.
 * Import from '@/typescript' instead of individual files.
 */

export type { ISurveyOption } from './ISurveyOption';
export type { IQuestion, BackendGroup } from './IQuestion';
export type { IStateKey, IStateInfo } from './IStateInfo';
export type { IHistoryEntry } from './IHistoryEntry';
export type {
  IStoredUser,
  IAuthState,
  IAuthApiResponse,
  IAuthContextValue,
  IChangePasswordPayload,
  IFcmTokenResponse,
  INotificationPayload,
  IUpdateProfilePayload,
} from './IAuth';
export type {
  IQueryValue,
  IQueryParams,
  IRequestOptions,
  IApiResponse,
  IApiAnswer,
  IServerResult,
} from './IApi';
export type { ICategory, ISortOption } from './ICategory';
