/**
 * Comprehensive test suite for the subscription system
 * Run this with: npm test or in your test environment
 */

import { supabase } from '../lib/supabase';
import { handlePurchase, checkSubscriptionStatus } from '../lib/purchaseService';
import { SubscriptionRecord } from '../types/subscription';

// Mock purchase data for testing
const mockPurchase = {
  productId: 'com.bibleapp.monthly_premium',
  transactionId: 'test_txn_123',
  transactionDate: new Date().toISOString(),
  transactionReceipt: 'mock_receipt_data'
};

describe('Subscription System Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Create anonymous test user
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    testUserId = data.user!.id;
    console.log('✅ Test user created:', testUserId);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from('subscriptions').delete().eq('user_id', testUserId);
    await supabase.auth.admin.deleteUser(testUserId);
    console.log('🧹 Test cleanup completed');
  });

  test('Purchase Processing', async () => {
    console.log('🧪 Testing purchase processing...');
    
    const result = await handlePurchase(
      testUserId,
      mockPurchase.productId,
      mockPurchase
    );

    expect(result.success).toBe(true);
    expect(result.subscription).toBeDefined();
    expect(result.subscription?.user_id).toBe(testUserId);
    expect(result.subscription?.product_id).toBe(mockPurchase.productId);
    expect(result.subscription?.status).toBe('active');

    console.log('✅ Purchase processed successfully');
  });

  test('Subscription Status Check', async () => {
    console.log('🧪 Testing subscription status check...');
    
    const status = await checkSubscriptionStatus(testUserId);
    
    expect(status.isActive).toBe(true);
    expect(status.subscription).toBeDefined();
    expect(status.subscription?.product_id).toBe(mockPurchase.productId);

    console.log('✅ Subscription status check passed');
  });

  test('Duplicate Purchase Prevention', async () => {
    console.log('🧪 Testing duplicate purchase prevention...');
    
    // Try to process the same purchase again
    const result = await handlePurchase(
      testUserId,
      mockPurchase.productId,
      mockPurchase
    );

    // Should still succeed (idempotent)
    expect(result.success).toBe(true);
    
    // Verify only one subscription exists
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUserId);

    expect(subs?.length).toBe(1);

    console.log('✅ Duplicate purchase prevention works');
  });

  test('Subscription Expiration', async () => {
    console.log('🧪 Testing subscription expiration...');
    
    // Set subscription to expired
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday

    const { error } = await supabase
      .from('subscriptions')
      .update({ expired_at: pastDate.toISOString() })
      .eq('user_id', testUserId);

    expect(error).toBeNull();

    // Check status should now be inactive
    const status = await checkSubscriptionStatus(testUserId);
    expect(status.isActive).toBe(false);

    console.log('✅ Subscription expiration works');
  });
});

// Integration test with real Supabase
async function runIntegrationTest() {
  console.log('🔬 Running integration test...');
  
  try {
    // Test anonymous auth
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    if (authError) throw authError;
    
    console.log('✅ Anonymous auth works');

    // Test database connection
    const { data, error } = await supabase.from('subscriptions').select('count').limit(1);
    if (error) throw error;
    
    console.log('✅ Database connection works');

    // Clean up test user
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Integration test completed successfully');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

// Performance test
async function runPerformanceTest() {
  console.log('⚡ Running performance test...');
  
  const start = Date.now();
  
  // Test multiple rapid subscription checks
  const promises = Array.from({ length: 10 }, async (_, i) => {
    const { data } = await supabase.auth.signInAnonymously();
    if (!data.user) throw new Error('Failed to create test user');
    
    const status = await checkSubscriptionStatus(data.user.id);
    await supabase.auth.admin.deleteUser(data.user.id);
    
    return status;
  });

  const results = await Promise.all(promises);
  const duration = Date.now() - start;
  
  console.log(`✅ Performance test completed: ${results.length} checks in ${duration}ms`);
  console.log(`⚡ Average: ${(duration / results.length).toFixed(2)}ms per check`);
}

// Export test functions
export {
  runIntegrationTest,
  runPerformanceTest
};

// Manual test runner (uncomment to run)
/*
if (require.main === module) {
  runIntegrationTest()
    .then(() => runPerformanceTest())
    .then(() => console.log('🎉 All tests completed!'))
    .catch(console.error);
}
*/