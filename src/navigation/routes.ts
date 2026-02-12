export const ROUTES = {
  ROOT: {
    ONBOARDING: 'Onboarding',
    APP: 'AppTabs',
  },
  TABS: {
    TIMER: 'TimerTab',
    STATISTICS: 'StatisticsTab',
    SETTINGS: 'SettingsTab',
  },
  TIMER: {
    HOME: 'HomeTimer',
    SESSION_COMPLETE: 'SessionComplete',
  },
} as const;

export type RouteValue<T extends Record<string, string>> = T[keyof T];
