# Bible App Subscription System

A comprehensive subscription management system for the Bible app using React Native, Expo, Supabase, and Apple In-App Purchases.

## Architecture Overview

```
📱 App Layer
├── hooks/useIAP.ts                 # IAP management with Expo Go support
├── app/plans/index.tsx             # Subscription plans screen
└── app/(tabs)/profile.tsx          # User profile with restore purchases

🔄 Service Layer  
├── lib/subscriptionService.ts      # Database operations
├── lib/purchaseService.ts          # Purchase processing logic
└── types/subscription.ts           # TypeScript interfaces

🗄️ Database Layer
├── Supabase Auth (auth.users)      # Anonymous user management
└── subscriptions table             # Subscription records
```

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    product_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    platform TEXT NOT NULL DEFAULT 'apple',
    original_transaction_id TEXT NOT NULL,
    latest_transaction_id TEXT,
    purchase_date TIMESTAMPTZ NOT NULL,
    expired_at TIMESTAMPTZ,
    auto_renewing BOOLEAN DEFAULT true,
    is_trial BOOLEAN DEFAULT false,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_subscriptions_user_id ON subscriptions(user_id),
    INDEX idx_subscriptions_status ON subscriptions(status),
    INDEX idx_subscriptions_expired_at ON subscriptions(expired_at),
    
    -- Constraints
    UNIQUE(user_id, original_transaction_id)
);

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
ON subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"  
ON subscriptions FOR ALL
USING (auth.uid() = user_id);
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd bible/
npm install react-native-iap @supabase/supabase-js
```

### 2. Configure Apple App Store Connect
1. Create subscription products in App Store Connect
2. Set product IDs in `hooks/useIAP.ts`:
```typescript
const PRODUCT_IDS = [
  'com.yourapp.monthly_premium',  
  'com.yourapp.yearly_premium'
];
```

### 3. Setup Supabase
1. Create the subscriptions table (see schema above)
2. Configure RLS policies
3. Add your Supabase credentials to `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Apple Receipt Validation (Optional)
For production, implement server-side receipt validation:
```typescript
// In lib/receiptValidator.ts
export async function validateAppleReceipt(receiptData: string) {
  // Send to Apple's verifyReceipt endpoint
  // Parse response for accurate subscription data
  // Return validated subscription info
}
```

## Usage Examples

### Purchase a Subscription
```typescript
import { useIAP } from '../hooks/useIAP';

const { purchaseProduct, isPurchasing } = useIAP({
  onPurchaseSuccess: () => {
    console.log('Purchase successful!');
    // User now has access to premium features
  },
  onPurchaseError: (error) => {
    console.error('Purchase failed:', error);
  }
});

// Trigger purchase
await purchaseProduct('com.yourapp.monthly_premium');
```

### Restore Purchases
```typescript
const { restorePurchases, isRestoring } = useIAP({
  onRestoreSuccess: () => {
    console.log('Purchases restored!');
  }
});

await restorePurchases();
```

### Check Subscription Status
```typescript
import { checkSubscriptionStatus } from '../lib/purchaseService';

const { isActive, subscription } = await checkSubscriptionStatus(userId);
if (isActive) {
  // Grant premium access
  console.log('Active subscription:', subscription);
}
```

## Key Features

### ✅ Anonymous Authentication
- Users don't need to create accounts
- Automatic anonymous user creation
- Purchases tied to device/Apple ID

### ✅ Expo Go Compatible
- Mock purchases in development
- Real IAP in production builds
- Graceful fallbacks

### ✅ Idempotent Operations
- Safe to run multiple times
- Prevents duplicate subscriptions
- Transaction safety

### ✅ Apple Guidelines Compliant
- Proper transaction finishing
- Receipt validation ready
- Restore purchases support

### ✅ Error Handling
- Comprehensive error catching
- User-friendly error messages
- Automatic retries where appropriate

## File Descriptions

### `hooks/useIAP.ts`
Central IAP management hook with:
- Connection management
- Product fetching
- Purchase flow handling
- Restore functionality
- Expo Go compatibility

### `lib/subscriptionService.ts`
Database operations for:
- Creating/updating subscriptions
- Syncing with Apple receipts
- User subscription retrieval
- Subscription status checking

### `lib/purchaseService.ts` 
Purchase processing logic:
- Handling completed purchases
- Processing restored purchases
- Status checking utilities

### `types/subscription.ts`
TypeScript interfaces for:
- Subscription records
- Apple receipt data
- Database field mappings

## Testing

### Development (Expo Go)
- Mock purchases simulate real flow
- No real charges occur
- Test all purchase states

### Production (TestFlight)
- Use Apple's Sandbox environment
- Create test accounts in App Store Connect
- Test real purchase flow

## Production Checklist

- [ ] Create subscription products in App Store Connect
- [ ] Set up Supabase database with proper RLS
- [ ] Configure Apple receipt validation (optional but recommended)
- [ ] Test purchase flow in Sandbox
- [ ] Test restore purchases
- [ ] Test subscription expiration handling
- [ ] Set up monitoring/analytics
- [ ] Configure cleanup Edge Function

## Monitoring & Analytics

Track key subscription metrics:
- Purchase conversion rates
- Subscription retention
- Restore success rates
- Error rates and types

## Support

For subscription-related issues:
1. Check Apple receipt validation
2. Verify Supabase connectivity
3. Review IAP connection status
4. Check product availability

## Security Considerations

- Receipt validation prevents fraud
- RLS ensures data privacy
- Anonymous auth protects user identity
- Transaction finishing prevents double-charging