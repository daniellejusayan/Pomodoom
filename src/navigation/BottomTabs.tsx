import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For tab icons

import SessionCompleteScreen from '../features/session/screens/SessionCompleteScreen';
import StatisticsScreen from '../features/statistics/screens/StatisticsScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import HomeTimerScreen from '../features/timer/screens/HomeTimerScreen';
import { colors } from '../core/theme/colors';
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
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: colors.textSecondary,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
					elevation: 12,
					shadowColor: colors.shadow,
					shadowOpacity: 0.25,
					shadowOffset: { width: 0, height: -4 },
					shadowRadius: 16,
				},
				headerStyle: { backgroundColor: colors.background },
				tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
			}}
		>
			<Tab.Screen
				name={ROUTES.TABS.STATISTICS}
				component={StatisticsScreen}
				options={{ title: 'Statistics',
					tabBarIcon: ({focused, color, size}) => (
						<Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} 
						size={size} color={color} />
					)
				}
				}
			/>
			<Tab.Screen
				name={ROUTES.TABS.TIMER}
				component={TimerStackNavigator}
				options={{ title: 'Home', 
					tabBarIcon: ({focused, color, size}) => (
						<Ionicons name={focused ? 'timer' : 'timer-outline'} 
						size={size} color={color} />
					)
				 }}
			/>
			<Tab.Screen
				name={ROUTES.TABS.SETTINGS}
				component={SettingsScreen}
				options={{ title: 'Settings',
					tabBarIcon: ({focused, color, size}) => (
						<Ionicons name={focused ? 'settings' : 'settings-outline'} 
						size={size} color={color} />
					)
				 }}
			/>
		</Tab.Navigator>
	);
}
