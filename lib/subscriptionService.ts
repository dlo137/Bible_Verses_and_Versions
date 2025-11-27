import { supabase } from '../lib/supabase';
import { SubscriptionRecord, AppleReceiptData } from '../types/subscription';

/**
 * Helper function to create or update subscription record
 * Ensures only ONE active subscription per user_id
 */
export async function createOrUpdateSubscription(record: SubscriptionRecord) {
  try {
    console.log('📝 Creating/updating subscription for user:', record.user_id);

    // First, check if user has existing subscription
    const { data: existingSubscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', record.user_id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching existing subscriptions:', fetchError);
      throw fetchError;
    }

    const now = new Date().toISOString();
    const existingSubscription = existingSubscriptions?.[0];

    // Determine subscription state based on dates
    const isTrialActive = record.trial_start && record.trial_end && 
      new Date(record.trial_end) > new Date() && !record.trial_canceled;
    
    const isPaidActive = record.renewal_date && 
      new Date(record.renewal_date) > new Date() && !record.cancel_date;
    
    const isActive = isTrialActive || isPaidActive;
    const isPremium = isActive;
    const isExpired = !isActive && (record.renewal_date && new Date(record.renewal_date) <= new Date());

    // Check if trial converted to paid
    const convertedAfterTrial = Boolean(
      record.trial_end && 
      record.purchase_date && 
      new Date(record.purchase_date) >= new Date(record.trial_end)
    );

    // Prepare the record with computed fields
    const subscriptionRecord: SubscriptionRecord = {
      ...record,
      is_active: Boolean(isActive),
      is_premium: Boolean(isPremium),
      is_expired: Boolean(isExpired),
      converted_after_trial: Boolean(convertedAfterTrial),
      updated_at: now,
      last_login: now,
    };

    if (existingSubscription) {
      // Update existing subscription
      console.log('🔄 Updating existing subscription:', existingSubscription.id);
      
      // Deactivate all other subscriptions for this user first
      if (isActive) {
        await supabase
          .from('subscriptions')
          .update({ 
            is_active: false, 
            is_premium: false,
            updated_at: now 
          })
          .eq('user_id', record.user_id)
          .neq('id', existingSubscription.id);
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .update(subscriptionRecord)
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating subscription:', error);
        throw error;
      }

      console.log('✅ Subscription updated successfully');
      return data;
    } else {
      // Create new subscription
      console.log('➕ Creating new subscription');
      
      // Ensure no other active subscriptions for this user
      if (isActive) {
        await supabase
          .from('subscriptions')
          .update({ 
            is_active: false, 
            is_premium: false,
            updated_at: now 
          })
          .eq('user_id', record.user_id);
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscriptionRecord,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating subscription:', error);
        throw error;
      }

      console.log('✅ Subscription created successfully');
      return data;
    }
  } catch (error) {
    console.error('❌ Error in createOrUpdateSubscription:', error);
    throw error;
  }
}

/**
 * Parse Apple receipt and sync with Supabase
 */
export async function syncSubscriptionFromApple(
  userId: string,
  receipt: AppleReceiptData
): Promise<SubscriptionRecord> {
  try {
    console.log('🍎 Syncing Apple receipt:', receipt);

    const purchaseDate = new Date(receipt.purchaseDate * 1000).toISOString();
    let renewalDate: string | null = null;
    let trialStart: string | null = null;
    let trialEnd: string | null = null;

    // Handle trial period
    if (receipt.isTrialPeriod && receipt.expirationDate) {
      trialStart = purchaseDate;
      trialEnd = new Date(receipt.expirationDate * 1000).toISOString();
    }

    // Handle renewal date for paid subscriptions
    if (receipt.expirationDate && !receipt.isTrialPeriod) {
      renewalDate = new Date(receipt.expirationDate * 1000).toISOString();
    }

    // Handle cancellation
    let cancelDate: string | null = null;
    if (receipt.cancellationDate) {
      cancelDate = new Date(receipt.cancellationDate * 1000).toISOString();
    }

    const subscriptionRecord: SubscriptionRecord = {
      user_id: userId,
      product_id: receipt.productId,
      purchase_source: 'ios',
      purchase_date: purchaseDate,
      renewal_date: renewalDate,
      cancel_date: cancelDate,
      trial_start: trialStart,
      trial_end: trialEnd,
      trial_canceled: Boolean(cancelDate && trialEnd && new Date(cancelDate) <= new Date(trialEnd)),
    };

    return await createOrUpdateSubscription(subscriptionRecord);
  } catch (error) {
    console.error('❌ Error syncing Apple receipt:', error);
    throw error;
  }
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string) {
  try {
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        last_login: now,
        updated_at: now 
      })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error updating last login:', error);
      throw error;
    }

    console.log('✅ Last login updated for user:', userId);
  } catch (error) {
    console.error('❌ Error in updateLastLogin:', error);
    // Don't throw - this shouldn't break the app
  }
}

/**
 * Get user's current subscription status
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ Error fetching subscription:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('❌ Error in getUserSubscription:', error);
    return null;
  }
}