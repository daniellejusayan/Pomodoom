export type PenaltyTypeDisplay = 'none' | 'warning' | 'resetTimer' | 'addTime' | 'lockMode';

const PENALTY_LABEL_MAP: Record<PenaltyTypeDisplay, string> = {
  none: 'None',
  warning: 'Warning',
  resetTimer: 'Reset Timer',
  addTime: 'Add Time',
  lockMode: 'Lock Mode',
};

const trimTrailingZero = (value: number, fractionDigits: number) => {
  const formatted = value.toFixed(fractionDigits);
  return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
};

export const formatPenaltyLabel = (penaltyType: string | null | undefined): string => {
  if (!penaltyType) return 'None';
  return PENALTY_LABEL_MAP[penaltyType as PenaltyTypeDisplay] ?? penaltyType;
};

export const formatDurationAdaptive = (secondsInput: number): string => {
  const seconds = Math.max(0, Math.floor(Number(secondsInput) || 0));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    const minutes = seconds / 60;
    const value = minutes < 10 ? trimTrailingZero(minutes, 1) : String(Math.round(minutes));
    return `${value}m`;
  }

  if (seconds < 86400) {
    const hours = seconds / 3600;
    const value = hours < 10 ? trimTrailingZero(hours, 1) : String(Math.round(hours));
    return `${value}h`;
  }

  const days = seconds / 86400;
  const value = days < 10 ? trimTrailingZero(days, 1) : String(Math.round(days));
  return `${value}d`;
};

export const getAdaptiveDurationUnit = (secondsInput: number): 's' | 'm' | 'h' | 'd' => {
  const seconds = Math.max(0, Math.floor(Number(secondsInput) || 0));
  if (seconds < 60) return 's';
  if (seconds < 3600) return 'm';
  if (seconds < 86400) return 'h';
  return 'd';
};

export const toAdaptiveDurationValue = (secondsInput: number, targetUnit: 's' | 'm' | 'h' | 'd'): number => {
  const seconds = Math.max(0, Number(secondsInput) || 0);
  switch (targetUnit) {
    case 's':
      return seconds;
    case 'm':
      return seconds / 60;
    case 'h':
      return seconds / 3600;
    case 'd':
      return seconds / 86400;
    default:
      return seconds;
  }
};
