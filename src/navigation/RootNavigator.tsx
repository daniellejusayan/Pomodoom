import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import OnboardingScreen from '../features/onboarding/screens/OnboardingScreen';
import { getOnboardingFlag, setOnboardingFlag } from '../services/storage';
import BottomTabs from './BottomTabs';
import { ROUTES } from './routes';
import { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

	useEffect(() => {
		const loadFlag = async () => {
			try {
				const stored = await getOnboardingFlag();
				setHasCompletedOnboarding(stored);
			} finally {
				setIsBootstrapping(false);
			}
		};

		loadFlag();
	}, []);

	const handleOnboardingComplete = async () => {
		setHasCompletedOnboarding(true);
		await setOnboardingFlag(true);
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
			<RootStack.Screen name={ROUTES.ROOT.ONBOARDING}>
				{(props) => <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />}
			</RootStack.Screen>
			<RootStack.Screen name={ROUTES.ROOT.APP} component={BottomTabs} />
		</RootStack.Navigator>
	);
}
