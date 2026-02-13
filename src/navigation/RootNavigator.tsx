import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import OnboardingScreen from '../features/onboarding/screens/OnboardingScreen';
import { getOnboardingFlag, setOnboardingFlag, resetOnboardingFlag } from '../services/storage';
import BottomTabs from './BottomTabs';
import { ROUTES } from './routes';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

// Set to true to always show onboarding (useful for testing)
const FORCE_SHOW_ONBOARDING = true;

export default function RootNavigator() {
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

	useEffect(() => {
		const loadFlag = async () => {
			try {
				// Reset onboarding in dev mode if FORCE_SHOW_ONBOARDING is true
				if (__DEV__ && FORCE_SHOW_ONBOARDING) {
					await resetOnboardingFlag();
					console.log('[DEV] Onboarding flag reset');
				}
				
				const stored = await getOnboardingFlag();
				console.log('[RootNavigator] Onboarding completed:', stored);
				setHasCompletedOnboarding(stored);
			} finally {
				setIsBootstrapping(false);
			}
		};

		loadFlag();
	}, []);

	const handleOnboardingComplete = async () => {
		console.log('[RootNavigator] Onboarding completed by user');
		setHasCompletedOnboarding(true);
		await setOnboardingFlag(true);
	};

	const initialRouteName = useMemo(() => {
		const route = hasCompletedOnboarding ? ROUTES.ROOT.APP : ROUTES.ROOT.ONBOARDING;
		console.log('[RootNavigator] Initial route:', route);
		return route;
	}, [hasCompletedOnboarding]);

	if (isBootstrapping) {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
			<RootStack.Screen name={ROUTES.ROOT.ONBOARDING}>
				{(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
			</RootStack.Screen>
			<RootStack.Screen name={ROUTES.ROOT.APP} component={BottomTabs} />
		</RootStack.Navigator>
	);
}
