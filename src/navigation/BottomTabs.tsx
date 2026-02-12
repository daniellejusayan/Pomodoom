import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import SessionCompleteScreen from '../features/session/screens/SessionCompleteScreen';
import StatisticsScreen from '../features/statistics/screens/StatisticsScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import HomeTimerScreen from '../features/timer/screens/HomeTimerScreen';
import { ROUTES } from './routes';
import { BottomTabParamList, TimerStackParamList } from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const TimerStack = createNativeStackNavigator<TimerStackParamList>();

function TimerStackNavigator() {
	return (
		<TimerStack.Navigator>
			<TimerStack.Screen
				name={ROUTES.TIMER.HOME}
				component={HomeTimerScreen}
				options={{ headerShown: false }}
			/>
			<TimerStack.Screen
				name={ROUTES.TIMER.SESSION_COMPLETE}
				component={SessionCompleteScreen}
				options={{ title: 'Session Complete' }}
			/>
		</TimerStack.Navigator>
	);
}

export default function BottomTabs() {
	return (
		<Tab.Navigator screenOptions={{ headerShown: false }}>
			<Tab.Screen
				name={ROUTES.TABS.TIMER}
				component={TimerStackNavigator}
				options={{ title: 'Home' }}
			/>
			<Tab.Screen
				name={ROUTES.TABS.STATISTICS}
				component={StatisticsScreen}
				options={{ title: 'Statistics' }}
			/>
			<Tab.Screen
				name={ROUTES.TABS.SETTINGS}
				component={SettingsScreen}
				options={{ title: 'Settings' }}
			/>
		</Tab.Navigator>
	);
}
