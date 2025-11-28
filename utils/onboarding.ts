import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = '@onboarding_completed';

/**
 * Mark onboarding as completed
 */
export async function markOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Check if user has completed onboarding
 * @returns true if completed, false otherwise
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
    return completed === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Reset onboarding status (for testing/debugging)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    // Silent error handling
  }
}
