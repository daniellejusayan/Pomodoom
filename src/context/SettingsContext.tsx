import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pomodoom_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export type PenaltyType = 'none' | 'warning' | 'resetTimer' | 'addTime' | 'lockMode';

const VALID_PENALTY_TYPES: PenaltyType[] = ['none', 'warning', 'resetTimer', 'addTime', 'lockMode'];

const sanitizePenaltyType = (value: unknown): PenaltyType => {
  return typeof value === 'string' && (VALID_PENALTY_TYPES as string[]).includes(value)
    ? (value as PenaltyType)
    : 'none';
};

interface SettingsContextType {

  // Duration settings
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  
  // Penalty settings
  penaltyType: PenaltyType;
  
  // Feedback settings
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // Session statistics
  breakCycleCount: number; // number of normal breaks since last long break
  longBreaksCompleted: number;
  totalSessions: number; // number of completed focus sessions
  totalInterruptions: number; // cumulative pause/interrupt attempts across all sessions
  firstUseDate: string | null; // ISO date string
  dailySessions: { [date: string]: number }; // sessions count per day

  // Update functions
  setFocusDuration: (duration: number) => Promise<void>;
  setBreakDuration: (duration: number) => Promise<void>;
  setLongBreakDuration: (duration: number) => Promise<void>;
  setPenaltyType: (type: PenaltyType) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setVibrationEnabled: (enabled: boolean) => Promise<void>;

  // Stats functions
  incrementBreakCycle: () => Promise<void>;
  resetBreakCycle: () => Promise<void>;
  incrementLongBreaks: () => Promise<void>;
  incrementSessions: () => Promise<void>;
  incrementDailySessions: () => Promise<void>;
  addSessionInterruptions: (count: number) => Promise<void>;
  loading: boolean;
}



// Provider
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // local state declarations
  const [focusDuration, setFocusDurationState] = useState(25);
  const [breakDuration, setBreakDurationState] = useState(5);
  const [longBreakDuration, setLongBreakDurationState] = useState(15);
  const [penaltyType, setPenaltyTypeState] = useState<PenaltyType>('none');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
  // stats
  const [breakCycleCount, setBreakCycleCount] = useState(0);
  const [longBreaksCompleted, setLongBreaksCompleted] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalInterruptions, setTotalInterruptions] = useState(0);
  const [firstUseDate, setFirstUseDate] = useState<string | null>(null);
  const [dailySessions, setDailySessions] = useState<{ [date: string]: number }>({});
  const [loading, setLoading] = useState(true);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        setFocusDurationState(settings.focusDuration ?? 25);
        setBreakDurationState(settings.breakDuration ?? 5);
        setLongBreakDurationState(settings.longBreakDuration ?? 15);
        setPenaltyTypeState(sanitizePenaltyType(settings.penaltyType));
        setSoundEnabledState(settings.soundEnabled ?? true);
        setVibrationEnabledState(settings.vibrationEnabled ?? true);
        setBreakCycleCount(settings.breakCycleCount ?? 0);
        setLongBreaksCompleted(settings.longBreaksCompleted ?? 0);
        setTotalSessions(settings.totalSessions ?? 0);
        setTotalInterruptions(
          Number.isFinite(settings.totalInterruptions)
            ? Math.max(0, Math.floor(settings.totalInterruptions))
            : 0
        );
        setFirstUseDate(settings.firstUseDate ?? null);
        setDailySessions(settings.dailySessions ?? {});
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setFocusDuration = async (duration: number) => {
    setFocusDurationState(duration);
    await saveSettings({
      focusDuration: duration,
      breakDuration,
      longBreakDuration,
      penaltyType,
      soundEnabled,
      vibrationEnabled,
      breakCycleCount,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const setBreakDuration = async (duration: number) => {
    setBreakDurationState(duration);
    await saveSettings({
      focusDuration,
      breakDuration: duration,
      longBreakDuration,
      penaltyType,
      soundEnabled,
      vibrationEnabled,
      breakCycleCount,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const setLongBreakDuration = async (duration: number) => {
    setLongBreakDurationState(duration);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration: duration,
      penaltyType,
      soundEnabled,
      vibrationEnabled,
      breakCycleCount,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const setPenaltyType = async (type: PenaltyType) => {
    setPenaltyTypeState(type);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      penaltyType: type,
      soundEnabled,
      vibrationEnabled,
      breakCycleCount,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      penaltyType,
      soundEnabled: enabled,
      vibrationEnabled,
      breakCycleCount,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const setVibrationEnabled = async (enabled: boolean) => {
    setVibrationEnabledState(enabled);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      penaltyType,
      soundEnabled,
      vibrationEnabled: enabled,
      breakCycleCount,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const incrementBreakCycle = async () => {
    setBreakCycleCount(prev => {
      const next = prev + 1;
      saveSettings({
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount: next,
        longBreaksCompleted,
        totalSessions,
        totalInterruptions,
        firstUseDate,
        dailySessions,
      });
      return next;
    });
  };

  const resetBreakCycle = async () => {
    setBreakCycleCount(0);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      penaltyType,
      soundEnabled,
      vibrationEnabled,
      breakCycleCount: 0,
      longBreaksCompleted,
      totalSessions,
      totalInterruptions,
      firstUseDate,
      dailySessions,
    });
  };

  const incrementLongBreaks = async () => {
    setLongBreaksCompleted(prev => {
      const next = prev + 1;
      saveSettings({
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount,
        longBreaksCompleted: next,
        totalSessions,
      });
      return next;
    });
  };

  const incrementSessions = async () => {
    setTotalSessions(prev => {
      const next = prev + 1;
      // set firstUseDate if absent
      if (!firstUseDate) {
        setFirstUseDate(new Date().toISOString());
      }
      saveSettings({
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount,
        longBreaksCompleted,
        totalSessions: next,
        totalInterruptions,
        firstUseDate: firstUseDate || new Date().toISOString(),
        dailySessions,
      });
      return next;
    });
  };

  // 🆕 Method to increment today's daily session count
  const incrementDailySessions = async () => {
    const today = new Date().toISOString().split('T')[0];
    setDailySessions(prev => {
      const nextCount = (prev[today] || 0) + 1;
      const updated = { ...prev, [today]: nextCount };
      saveSettings({
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount,
        longBreaksCompleted,
        totalSessions,
        totalInterruptions,
        firstUseDate,
        dailySessions: updated,
      });
      return updated;
    });
  };

  // 🆕 Record interruptions count when session ends
  const addSessionInterruptions = async (count: number) => {
    const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
    if (safeCount === 0) {
      return;
    }

    setTotalInterruptions(prev => {
      const safePrev = Number.isFinite(prev) ? prev : 0;
      const next = safePrev + safeCount;
      saveSettings({
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount,
        longBreaksCompleted,
        totalSessions,
        totalInterruptions: next,
        firstUseDate,
        dailySessions,
      });
      return next;
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount,
        longBreaksCompleted,
        totalSessions,
        totalInterruptions,
        firstUseDate,
        dailySessions,
        setFocusDuration,
        setBreakDuration,
        setLongBreakDuration,
        setPenaltyType,
        setSoundEnabled,
        setVibrationEnabled,
        incrementBreakCycle,
        resetBreakCycle,
        incrementLongBreaks,
        incrementSessions,
        incrementDailySessions,
        addSessionInterruptions,
        loading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};