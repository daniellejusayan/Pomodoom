/**
 * Shared types for global context state
 */
export interface Session {
  id: string;
  start: number; // epoch ms
  end?: number; // epoch ms
  duration?: number; // seconds
  notes?: string;
}

export interface Settings {
  workDuration: number; // seconds
  shortBreak: number; // seconds
  longBreak: number; // seconds
  dailyGoal: number; // sessions per day
  theme: 'light' | 'dark' | 'system';
}

export interface SessionContextType {
  activeSession: Session | null;
  history: Session[];
  startSession: (payload?: Partial<Session>) => void;
  completeSession: (notes?: string) => void;
  addSession: (session: Session) => void;
}

export interface SettingsContextType {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  resetSettings: () => void;
}

export default null;
