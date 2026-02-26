import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PenaltyType = 'warning' | 'resetTimer' | 'addTime';

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
  
  // Update functions
  setFocusDuration: (duration: number) => Promise<void>;
  setBreakDuration: (duration: number) => Promise<void>;
  setLongBreakDuration: (duration: number) => Promise<void>;
  setPenaltyType: (type: PenaltyType) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setVibrationEnabled: (enabled: boolean) => Promise<void>;
  
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = '@pomodoom_settings';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [focusDuration, setFocusDurationState] = useState(25);
  const [breakDuration, setBreakDurationState] = useState(5);
  const [longBreakDuration, setLongBreakDurationState] = useState(15);
  const [penaltyType, setPenaltyTypeState] = useState<PenaltyType>('warning');
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [vibrationEnabled, setVibrationEnabledState] = useState(true);
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
        setPenaltyTypeState(settings.penaltyType ?? 'warning');
        setSoundEnabledState(settings.soundEnabled ?? true);
        setVibrationEnabledState(settings.vibrationEnabled ?? true);
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
        setFocusDuration,
        setBreakDuration,
        setLongBreakDuration,
        setPenaltyType,
        setSoundEnabled,
        setVibrationEnabled,
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