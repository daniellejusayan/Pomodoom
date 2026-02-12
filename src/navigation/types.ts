import { NavigatorScreenParams } from '@react-navigation/native';

import { ROUTES } from './routes';

export type TimerStackParamList = {
	[ROUTES.TIMER.HOME]: undefined;
	[ROUTES.TIMER.SESSION_COMPLETE]: { sessionId?: string } | undefined;
};

export type BottomTabParamList = {
	[ROUTES.TABS.TIMER]: NavigatorScreenParams<TimerStackParamList>;
	[ROUTES.TABS.STATISTICS]: undefined;
	[ROUTES.TABS.SETTINGS]: undefined;
};

export type RootStackParamList = {
	[ROUTES.ROOT.ONBOARDING]: undefined;
	[ROUTES.ROOT.APP]: NavigatorScreenParams<BottomTabParamList>;
};
