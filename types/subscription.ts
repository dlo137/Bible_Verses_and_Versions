export interface SubscriptionRecord {
  id?: string;
  user_id: string;
  product_id: string;
  purchase_source?: string;
  
  trial_start?: string | null;
  trial_end?: string | null;
  trial_canceled?: boolean;
  
  is_premium?: boolean;
  is_active?: boolean;
  is_expired?: boolean;
  converted_after_trial?: boolean;
  
  purchase_date?: string | null;
  renewal_date?: string | null;
  cancel_date?: string | null;
  expired_at?: string | null;
  
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppleReceiptData {
  productId: string;
  transactionId: string;
  originalTransactionId: string;
  purchaseDate: number;
  expirationDate?: number;
  isTrialPeriod?: boolean;
  cancellationDate?: number;
  webOrderLineItemId?: string;
}

export interface PurchaseResult {
  success: boolean;
  subscription?: SubscriptionRecord;
  error?: string;
}

// Field update triggers mapping
export const FIELD_UPDATE_EVENTS = {
  purchase_date: ['first_purchase', 'trial_start', 'subscription_purchase'],
  renewal_date: ['purchase', 'renewal', 'restore'],
  cancel_date: ['cancellation', 'refund'],
  expired_at: ['expiration', 'cancellation'],
  converted_after_trial: ['trial_conversion_to_paid'],
  trial_start: ['trial_purchase'],
  trial_end: ['trial_purchase', 'trial_conversion'],
  is_active: ['purchase', 'renewal', 'restore', 'expiration', 'cancellation'],
  is_expired: ['expiration', 'renewal_check'],
  is_premium: ['purchase', 'trial_start', 'expiration', 'cancellation'],
  trial_canceled: ['trial_expiration_without_conversion', 'manual_cancellation']
} as const;