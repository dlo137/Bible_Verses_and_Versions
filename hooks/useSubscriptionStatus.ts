import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SubscriptionRecord } from '../types/subscription';
import { checkSubscriptionStatus } from '../lib/purchaseService';
import { getOrCreateUser } from '../lib/authHelper';

export interface SubscriptionStatus {
  isActive: boolean;
  subscription: SubscriptionRecord | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  timeUntilExpiry: number | null; // milliseconds until expiry
  daysUntilExpiry: number | null; // days until expiry (rounded)
}

/**
 * Hook to manage and track user subscription status
 * Automatically refreshes on app focus and provides real-time status
 */
export const useSubscriptionStatus = (): SubscriptionStatus => {
  const [isActive, setIsActive] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate time until subscription expires
  const timeUntilExpiry = subscription?.expired_at 
    ? new Date(subscription.expired_at).getTime() - Date.now()
    : null;

  const daysUntilExpiry = timeUntilExpiry 
    ? Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24))
    : null;

  // Refresh subscription status
  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get or create user (anonymous or test user)
      const user = await getOrCreateUser();
      
      if (!user) {
        throw new Error('Unable to authenticate user');
      }
      
      console.log('👤 Using user:', user.id);

      // Check subscription status
      const result = await checkSubscriptionStatus(user.id);
      
      setIsActive(result.isActive);
      setSubscription(result.subscription || null);

      console.log('📱 Subscription status refreshed:', {
        isActive: result.isActive,
        productId: result.subscription?.product_id,
        expiresDate: result.subscription?.expired_at
      });

    } catch (err: any) {
      console.error('❌ Error refreshing subscription status:', err);
      setError(err.message || 'Failed to check subscription status');
      setIsActive(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and subscription to auth changes
  useEffect(() => {
    refreshStatus();

    // Listen for auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          refreshStatus();
        } else if (event === 'SIGNED_OUT') {
          setIsActive(false);
          setSubscription(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [refreshStatus]);

  // Auto-refresh when subscription is about to expire
  useEffect(() => {
    if (!subscription?.expired_at) return;

    const expiryTime = new Date(subscription.expired_at).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // If subscription expires within 24 hours, check more frequently
    if (timeUntilExpiry > 0 && timeUntilExpiry < 24 * 60 * 60 * 1000) {
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const currentTimeUntilExpiry = expiryTime - currentTime;

        // If expired, refresh status
        if (currentTimeUntilExpiry <= 0) {
          console.log('⏰ Subscription expired, refreshing status...');
          refreshStatus();
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [subscription?.expired_at, refreshStatus]);

  // Real-time subscription updates via Supabase
  useEffect(() => {
    if (!subscription) return;

    // Subscribe to changes on the user's subscription record
    const channel = supabase
      .channel('subscription_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${subscription.user_id}`
        },
        (payload) => {
          console.log('📱 Real-time subscription update:', payload);
          refreshStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscription?.user_id, refreshStatus]);

  return {
    isActive,
    subscription,
    isLoading,
    error,
    refreshStatus,
    timeUntilExpiry,
    daysUntilExpiry
  };
};

/**
 * Hook to check if user has access to premium features
 * Returns a simple boolean for feature gating
 */
export const usePremiumAccess = (): {
  hasPremiumAccess: boolean;
  isLoading: boolean;
  checkAccess: () => Promise<boolean>;
} => {
  const { isActive, isLoading, refreshStatus } = useSubscriptionStatus();

  const checkAccess = useCallback(async (): Promise<boolean> => {
    await refreshStatus();
    return isActive;
  }, [refreshStatus, isActive]);

  return {
    hasPremiumAccess: isActive,
    isLoading,
    checkAccess
  };
};

/**
 * Hook for subscription expiry warnings
 * Provides warnings when subscription is about to expire
 */
export const useSubscriptionWarnings = (): {
  showExpiryWarning: boolean;
  warningMessage: string | null;
  daysLeft: number | null;
} => {
  const { isActive, daysUntilExpiry, subscription } = useSubscriptionStatus();

  const showExpiryWarning = isActive && daysUntilExpiry !== null && daysUntilExpiry <= 7;
  
  let warningMessage = null;
  if (showExpiryWarning && daysUntilExpiry !== null) {
    if (daysUntilExpiry <= 1) {
      warningMessage = 'Your subscription expires today! Renew now to continue enjoying premium features.';
    } else if (daysUntilExpiry <= 3) {
      warningMessage = `Your subscription expires in ${daysUntilExpiry} days. Consider renewing soon.`;
    } else {
      warningMessage = `Your subscription expires in ${daysUntilExpiry} days.`;
    }
  }

  return {
    showExpiryWarning,
    warningMessage,
    daysLeft: daysUntilExpiry
  };
};