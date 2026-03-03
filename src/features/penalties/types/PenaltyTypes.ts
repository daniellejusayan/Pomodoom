export type PenaltyType = 'none' | 'warning' | 'resetTimer' | 'addTime' | 'lockMode';

export interface Interruption {
  id: string;
  sessionId: string;
  timestamp: Date;
  reason: 'manual_pause' | 'app_background' | 'manual_stop';
  penaltyApplied: PenaltyType | null;
}

export interface PenaltyAction {
  type: PenaltyType;
  message: string;
  timeAddedMinutes?: number;
  pauseCount?: number;
}