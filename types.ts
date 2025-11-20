export interface RelatedQuestion {
  question: string;
  answer: string;
}

export interface RelatedScripture {
  verse: string;
  text: string;
}

export interface PrincipleResponse {
  id: string; // Unique identifier for persistence
  category: string; // e.g., "MARRIAGE", "LEADERSHIP", "ANXIETY"
  corePrinciple: string;
  sourceReference: string;
  actionPlan: string[];
  relatedQuestions: RelatedQuestion[];
  additionalScriptures: RelatedScripture[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NO_MATCH = 'NO_MATCH',
}