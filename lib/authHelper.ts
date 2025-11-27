import { supabase } from '../lib/supabase';

// Test user credentials for development
const TEST_USER_EMAIL = 'test@bibleapp.dev';
const TEST_USER_PASSWORD = 'testpassword123';

export async function ensureTestUser(): Promise<{ user: any; isNew: boolean }> {
  try {
    // Try to get current user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      return { user: currentUser, isNew: false };
    }

    // Try to sign in with test user
    let { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });

    if (error && error.message.includes('Invalid login credentials')) {
      // Test user doesn't exist, create it
      console.log('👤 Creating test user...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });

      if (signUpError) {
        throw signUpError;
      }

      return { user: signUpData.user, isNew: true };
    }

    if (error) {
      throw error;
    }

    return { user: data.user, isNew: false };
  } catch (error: any) {
    console.error('❌ Error ensuring test user:', error);
    throw new Error(`Failed to create/login test user: ${error.message}`);
  }
}

export async function getOrCreateUser() {
  try {
    // Try anonymous first
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      return currentUser;
    }

    // Try anonymous sign-in
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    
    if (!anonError && anonData.user) {
      return anonData.user;
    }

    // Fallback to test user
    console.log('🔄 Anonymous auth failed, using test user...');
    const { user } = await ensureTestUser();
    return user;
  } catch (error: any) {
    console.error('❌ Error getting/creating user:', error);
    throw error;
  }
}