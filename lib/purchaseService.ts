import { Platform } from 'react-native';
import { AppleReceiptData, SubscriptionRecord } from '../types/subscription';
import { createOrUpdateSubscription, syncSubscriptionFromApple, getUserSubscription } from './subscriptionService';

export interface PurchaseResult {
  success: boolean;
  subscription?: SubscriptionRecord;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  restoredCount: number;
  subscriptions?: SubscriptionRecord[];
  error?: string;
}

/**
 * Handle a successful purchase by updating Supabase subscription
 * This is called by the useIAP hook after a purchase is complete
 */
export const handlePurchase = async (
  userId: string, 
  productId: string, 
  purchase: any // Purchase object from react-native-iap
): Promise<PurchaseResult> => {
  try {
    console.log('🔄 Processing purchase for user:', userId);
    
    // Parse Apple receipt data
    const receipt: AppleReceiptData = {
      productId: purchase.productId,
      transactionId: purchase.transactionId || '',
      originalTransactionId: (purchase as any).originalTransactionId || purchase.transactionId || '',
      purchaseDate: new Date(purchase.transactionDate).getTime() / 1000,
      isTrialPeriod: false, // This would need Apple receipt validation for accurate data
    };

    // Sync with Supabase
    const subscription = await syncSubscriptionFromApple(userId, receipt);
    
    console.log('✅ Purchase processed successfully:', subscription.id);
    
    return {
      success: true,
      subscription,
    };
  } catch (error: any) {
    console.error('❌ Error processing purchase:', error);
    return {
      success: false,
      error: error.message || 'Failed to process purchase',
    };
  }
};

/**
 * Handle multiple restored purchases and sync with Supabase
 * This is called by the useIAP hook during restore purchases
 */
export const handleRestorePurchases = async (
  userId: string, 
  purchases: any[]
): Promise<RestoreResult> => {
  try {
    console.log(`🔄 Processing ${purchases.length} restored purchases for user:`, userId);
    
    const subscriptions: SubscriptionRecord[] = [];
    
    // Process each purchase
    for (const purchase of purchases) {
      try {
        const receipt: AppleReceiptData = {
          productId: purchase.productId,
          transactionId: purchase.transactionId || '',
          originalTransactionId: (purchase as any).originalTransactionId || purchase.transactionId || '',
          purchaseDate: new Date(purchase.transactionDate).getTime() / 1000,
          isTrialPeriod: false,
        };

        const subscription = await syncSubscriptionFromApple(userId, receipt);
        subscriptions.push(subscription);
        
        console.log(`✅ Restored subscription: ${subscription.id}`);
      } catch (error) {
        console.error('❌ Error restoring purchase:', purchase.productId, error);
        // Continue with other purchases even if one fails
      }
    }

    return {
      success: true,
      restoredCount: subscriptions.length,
      subscriptions,
    };
  } catch (error: any) {
    console.error('❌ Error during restore:', error);
    return {
      success: false,
      restoredCount: 0,
      error: error.message || 'Restore failed',
    };
  }
};

/**
 * Check the current subscription status for a user
 */
export const checkSubscriptionStatus = async (userId: string): Promise<{
  isActive: boolean;
  subscription?: SubscriptionRecord;
}> => {
  try {
    const subscription = await getUserSubscription(userId);
    return {
      isActive: !!subscription,
      subscription: subscription || undefined,
    };
  } catch (error) {
    console.error('❌ Error checking subscription status:', error);
    return {
      isActive: false,
    };
  }
};