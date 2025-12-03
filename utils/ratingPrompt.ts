import AsyncStorage from '@react-native-async-storage/async-storage';

const VERSE_VIEW_COUNT_KEY = '@verse_view_count';
const LAST_RATING_PROMPT_KEY = '@last_rating_prompt_date';
const RATING_PROMPTED_KEY = '@rating_prompted';

/**
 * Increment the verse view count
 * @returns The new view count
 */
export async function incrementVerseViewCount(): Promise<number> {
  try {
    const countStr = await AsyncStorage.getItem(VERSE_VIEW_COUNT_KEY);
    const count = countStr ? parseInt(countStr, 10) : 0;
    const newCount = count + 1;
    await AsyncStorage.setItem(VERSE_VIEW_COUNT_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error('Error incrementing verse view count:', error);
    return 0;
  }
}

/**
 * Reset the verse view count to 0
 */
export async function resetVerseViewCount(): Promise<void> {
  try {
    await AsyncStorage.setItem(VERSE_VIEW_COUNT_KEY, '0');
  } catch (error) {
    console.error('Error resetting verse view count:', error);
  }
}

/**
 * Get the current verse view count
 */
export async function getVerseViewCount(): Promise<number> {
  try {
    const countStr = await AsyncStorage.getItem(VERSE_VIEW_COUNT_KEY);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    console.error('Error getting verse view count:', error);
    return 0;
  }
}

/**
 * Check if we should show the rating prompt
 * - Shows after 3rd verse view
 * - Only shows once every 3 days
 * @returns true if should show, false otherwise
 */
export async function shouldShowRatingPrompt(): Promise<boolean> {
  try {
    // Check if user has already been prompted in the last 3 days
    const lastPromptStr = await AsyncStorage.getItem(LAST_RATING_PROMPT_KEY);

    if (lastPromptStr) {
      const lastPromptDate = new Date(lastPromptStr);
      const now = new Date();
      const daysSinceLastPrompt = (now.getTime() - lastPromptDate.getTime()) / (1000 * 60 * 60 * 24);

      // Don't show if less than 3 days have passed
      if (daysSinceLastPrompt < 3) {
        console.log('Rating prompt: Skipping - shown within last 3 days');
        return false;
      }
    }

    // Check verse view count
    const viewCount = await getVerseViewCount();

    // Show prompt on the 3rd verse view
    if (viewCount === 3) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking if should show rating prompt:', error);
    return false;
  }
}

/**
 * Mark that the rating prompt has been shown
 */
export async function markRatingPromptShown(): Promise<void> {
  try {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(LAST_RATING_PROMPT_KEY, now);
    await resetVerseViewCount();
    console.log('Rating prompt: Marked as shown, reset view count');
  } catch (error) {
    console.error('Error marking rating prompt as shown:', error);
  }
}

/**
 * Mark that user has rated the app (won't show prompt again)
 * Note: With native StoreReview, this is managed automatically by the OS
 * These functions are kept for backwards compatibility but may not be needed
 */
export async function markUserRated(): Promise<void> {
  try {
    await AsyncStorage.setItem(RATING_PROMPTED_KEY, 'true');
    console.log('Rating prompt: User has rated the app');
  } catch (error) {
    console.error('Error marking user as rated:', error);
  }
}

/**
 * Check if user has already rated the app
 * Note: With native StoreReview, this is managed automatically by the OS
 */
export async function hasUserRated(): Promise<boolean> {
  try {
    const rated = await AsyncStorage.getItem(RATING_PROMPTED_KEY);
    return rated === 'true';
  } catch (error) {
    console.error('Error checking if user has rated:', error);
    return false;
  }
}
