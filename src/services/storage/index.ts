import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = 'pomodoom_onboarding_completed';

/**
 * Read onboarding completion flag.
 */
export const getOnboardingFlag = async (): Promise<boolean> => {
	try {
		const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
		return value === 'true';
	} catch (error) {
		console.error('Error reading onboarding flag', error);
		return false;
	}
};

/**
 * Persist onboarding completion flag.
 */
export const setOnboardingFlag = async (completed: boolean): Promise<void> => {
	try {
		await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, completed ? 'true' : 'false');
	} catch (error) {
		console.error('Error writing onboarding flag', error);
		throw error;
	}
};

/**
 * Clear onboarding flag (useful for QA/testing).
 */
export const resetOnboardingFlag = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
	} catch (error) {
		console.error('Error clearing onboarding flag', error);
		throw error;
	}
};

export { ONBOARDING_STORAGE_KEY };
