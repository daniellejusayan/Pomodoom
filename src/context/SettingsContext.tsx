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

const 
validateSettings = (settings: any) => {
  const focusDuration = Number(settings?.focusDuration ?? 25);
  const breakDuration = Number(settings?.breakDuration ?? 5);
  const longBreakDuration = Number(settings?.longBreakDuration ?? 15);
  const soundEnabled = typeof settings?.soundEnabled === 'boolean' ? settings.soundEnabled : true;
  const vibrationEnabled = typeof settings?.vibrationEnabled === 'boolean' ? settings.vibrationEnabled : true;

  if (!Number.isFinite(focusDuration) || focusDuration < 1 || focusDuration > 120) {
    throw new Error('focusDuration must be between 1 and 120 minutes');
  }
  if (!Number.isFinite(breakDuration) || breakDuration < 1 || breakDuration > 60) {
    throw new Error('breakDuration must be between 1 and 60 minutes');
  }
  if (!Number.isFinite(longBreakDuration) || longBreakDuration < 1 || longBreakDuration > 90) {
    throw new Error('longBreakDuration must be between 1 and 90 minutes');
  }

  return {
    focusDuration: Math.round(focusDuration),
    breakDuration: Math.round(breakDuration),
    longBreakDuration: Math.round(longBreakDuration),
    penaltyType: sanitizePenaltyType(settings?.penaltyType),
    penaltyTypeUsage: {
      none: Number(settings?.penaltyTypeUsage?.none ?? 0),
      warning: Number(settings?.penaltyTypeUsage?.warning ?? 0),
      resetTimer: Number(settings?.penaltyTypeUsage?.resetTimer ?? 0),
      addTime: Number(settings?.penaltyTypeUsage?.addTime ?? 0),
      lockMode: Number(settings?.penaltyTypeUsage?.lockMode ?? 0),
    },
    soundEnabled,
    vibrationEnabled,
    breakCycleCount: Number(settings?.breakCycleCount ?? 0),
    longBreaksCompleted: Number(settings?.longBreaksCompleted ?? 0),
    totalSessions: Number(settings?.totalSessions ?? 0),
    totalInterruptions: Number(settings?.totalInterruptions ?? 0),
    firstUseDate: typeof settings?.firstUseDate === 'string' ? settings.firstUseDate : null,
    dailySessions: typeof settings?.dailySessions === 'object' && settings?.dailySessions !== null ? settings.dailySessions : {},
  };
};

interface SettingsContextType {

  // Duration settings
  focusDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  
  // Penalty settings
  penaltyType: PenaltyType;
  penaltyTypeUsage: Record<PenaltyType, number>;
  recordPenaltyUsage: (type: PenaltyType) => Promise<void>;
  
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
  const [penaltyTypeUsage, setPenaltyTypeUsage] = useState<Record<PenaltyType, number>>({
    none: 0,
    warning: 0,
    resetTimer: 0,
    addTime: 0,
    lockMode: 0,
  });
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
        const normalized = validateSettings(settings);

        setFocusDurationState(normalized.focusDuration);
        setBreakDurationState(normalized.breakDuration);
        setLongBreakDurationState(normalized.longBreakDuration);
        setPenaltyTypeState(normalized.penaltyType);
        setPenaltyTypeUsage(normalized.penaltyTypeUsage);
        setSoundEnabledState(normalized.soundEnabled);
        setVibrationEnabledState(normalized.vibrationEnabled);
        setBreakCycleCount(normalized.breakCycleCount);
        setLongBreaksCompleted(normalized.longBreaksCompleted);
        setTotalSessions(normalized.totalSessions);
        setTotalInterruptions(normalized.totalInterruptions);
        setFirstUseDate(normalized.firstUseDate);
        setDailySessions(normalized.dailySessions);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // fallback to defaults, no crash
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
    const value = Number(duration);
    if (!Number.isFinite(value) || value < 1 || value > 120) {
      console.error('Invalid focus duration value:', duration);
      return;
    }
    const rounded = Math.round(value);
    setFocusDurationState(rounded);
    await saveSettings({
      focusDuration: rounded,
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
    const value = Number(duration);
    if (!Number.isFinite(value) || value < 1 || value > 60) {
      console.error('Invalid break duration value:', duration);
      return;
    }
    const rounded = Math.round(value);
    setBreakDurationState(rounded);
    await saveSettings({
      focusDuration,
      breakDuration: rounded,
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
    const value = Number(duration);
    if (!Number.isFinite(value) || value < 1 || value > 90) {
      console.error('Invalid long break duration value:', duration);
      return;
    }
    const rounded = Math.round(value);
    setLongBreakDurationState(rounded);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration: rounded,
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
    const normalized = sanitizePenaltyType(type);
    setPenaltyTypeState(normalized);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      penaltyType: normalized,
      penaltyTypeUsage,
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

  // increment usage counter and persist
  const recordPenaltyUsage = async (type: PenaltyType) => {
    setPenaltyTypeUsage(prev => {
      const next = {
        ...prev,
        [type]: (prev[type] || 0) + 1,
      } as Record<PenaltyType, number>;
      // save with updated counts
      saveSettings({
        focusDuration,
        breakDuration,
        longBreakDuration,
        penaltyType,
        penaltyTypeUsage: next,
        soundEnabled,
        vibrationEnabled,
        breakCycleCount,
        longBreaksCompleted,
        totalSessions,
        totalInterruptions,
        firstUseDate,
        dailySessions,
      });
      return next;
    });
  };

  const setSoundEnabled = async (enabled: boolean) => {
    setSoundEnabledState(enabled);
    await saveSettings({
      focusDuration,
      breakDuration,
      longBreakDuration,
      penaltyType,
      penaltyTypeUsage,
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
      penaltyTypeUsage,
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
        penaltyTypeUsage,
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
      penaltyTypeUsage,
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
        penaltyTypeUsage,
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
        penaltyTypeUsage,
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
        penaltyTypeUsage,
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
        penaltyTypeUsage,
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
        penaltyTypeUsage,
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
        recordPenaltyUsage,
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