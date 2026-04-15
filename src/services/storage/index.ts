import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = 'pomodoom_onboarding_completed';
const HOME_TUTORIAL_DISMISSED_STORAGE_KEY = 'pomodoom_home_tutorial_dismissed';
const STATISTICS_GUIDE_DISMISSED_STORAGE_KEY = 'pomodoom_statistics_guide_dismissed';
const SETTINGS_STORAGE_KEY = '@pomodoom_settings';
const SESSION_STORAGE_KEY = '@pomodoom_sessions';
const TODO_STORAGE_KEY = '@pomodoom_todos';

const APP_STORAGE_KEYS = [
	ONBOARDING_STORAGE_KEY,
	HOME_TUTORIAL_DISMISSED_STORAGE_KEY,
	STATISTICS_GUIDE_DISMISSED_STORAGE_KEY,
	SETTINGS_STORAGE_KEY,
	SESSION_STORAGE_KEY,
	TODO_STORAGE_KEY,
];

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

/**
 * Read home tutorial dismissed flag.
 */
export const getHomeTutorialDismissedFlag = async (): Promise<boolean> => {
	try {
		const value = await AsyncStorage.getItem(HOME_TUTORIAL_DISMISSED_STORAGE_KEY);
		return value === 'true';
	} catch (error) {
		console.error('Error reading home tutorial flag', error);
		return false;
	}
};

/**
 * Persist home tutorial dismissed flag.
 */
export const setHomeTutorialDismissedFlag = async (dismissed: boolean): Promise<void> => {
	try {
		await AsyncStorage.setItem(HOME_TUTORIAL_DISMISSED_STORAGE_KEY, dismissed ? 'true' : 'false');
	} catch (error) {
		console.error('Error writing home tutorial flag', error);
		throw error;
	}
};

/**
 * Clear home tutorial flag (useful for QA/testing).
 */
export const resetHomeTutorialDismissedFlag = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(HOME_TUTORIAL_DISMISSED_STORAGE_KEY);
	} catch (error) {
		console.error('Error clearing home tutorial flag', error);
		throw error;
	}
};

/**
 * Read statistics guide dismissed flag.
 */
export const getStatisticsGuideDismissedFlag = async (): Promise<boolean> => {
	try {
		const value = await AsyncStorage.getItem(STATISTICS_GUIDE_DISMISSED_STORAGE_KEY);
		return value === 'true';
	} catch (error) {
		console.error('Error reading statistics guide flag', error);
		return false;
	}
};

/**
 * Persist statistics guide dismissed flag.
 */
export const setStatisticsGuideDismissedFlag = async (dismissed: boolean): Promise<void> => {
	try {
		await AsyncStorage.setItem(STATISTICS_GUIDE_DISMISSED_STORAGE_KEY, dismissed ? 'true' : 'false');
	} catch (error) {
		console.error('Error writing statistics guide flag', error);
		throw error;
	}
};

/**
 * Clear statistics guide flag.
 */
export const resetStatisticsGuideDismissedFlag = async (): Promise<void> => {
	try {
		await AsyncStorage.removeItem(STATISTICS_GUIDE_DISMISSED_STORAGE_KEY);
	} catch (error) {
		console.error('Error clearing statistics guide flag', error);
		throw error;
	}
};

/**
 * Clear all known Pomodoom local data keys.
 */
export const clearAllAppData = async (): Promise<void> => {
	try {
		await AsyncStorage.multiRemove(APP_STORAGE_KEYS);
	} catch (error) {
		console.error('Error clearing app data', error);
		throw error;
	}
};

export {
	ONBOARDING_STORAGE_KEY,
	HOME_TUTORIAL_DISMISSED_STORAGE_KEY,
	STATISTICS_GUIDE_DISMISSED_STORAGE_KEY,
	SETTINGS_STORAGE_KEY,
	SESSION_STORAGE_KEY,
	TODO_STORAGE_KEY,
	APP_STORAGE_KEYS,
};
