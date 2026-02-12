import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import OnboardingScreen from '../features/onboarding/screens/OnboardingScreen';
import BottomTabs from './BottomTabs';
import { ROUTES } from './routes';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const ONBOARDING_STORAGE_KEY = 'pomodoom_onboarding_completed';

export default function RootNavigator() {
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

	useEffect(() => {
		const loadFlag = async () => {
			try {
				const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
				setHasCompletedOnboarding(stored === 'true');
			} finally {
				setIsBootstrapping(false);
			}
		};

		loadFlag();
	}, []);

	const handleOnboardingComplete = async () => {
		setHasCompletedOnboarding(true);
		await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
	};

	const initialRouteName = useMemo(
		() => (hasCompletedOnboarding ? ROUTES.ROOT.APP : ROUTES.ROOT.ONBOARDING),
		[hasCompletedOnboarding],
	);

	if (isBootstrapping) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
			{!hasCompletedOnboarding && (
				<RootStack.Screen name={ROUTES.ROOT.ONBOARDING}>
					{(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
				</RootStack.Screen>
			)}
			<RootStack.Screen name={ROUTES.ROOT.APP} component={BottomTabs} />
		</RootStack.Navigator>
	);
}
