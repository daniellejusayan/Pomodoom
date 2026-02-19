import React, { createContext, useContext, useState } from 'react';
import type { Settings, SettingsContextType } from './types';

const defaultSettings: Settings = {
  workDuration: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  dailyGoal: 4,
  theme: 'system',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * SettingsProvider holds user preferences. Persistence should be handled
 * by services/storage to keep separation of concerns.
 */
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  const resetSettings = () => setSettings(defaultSettings);

  const value: SettingsContextType = { settings, updateSettings, resetSettings };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

export default SettingsContext;
