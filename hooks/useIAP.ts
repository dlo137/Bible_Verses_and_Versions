import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { handlePurchase, handleRestorePurchases } from '../lib/purchaseService';
import { getOrCreateUser } from '../lib/authHelper';

// Conditionally import react-native-iap only if not in Expo Go
let RNIap: any = null;
let isIAPAvailable = false;

try {
  // Only import if not in Expo Go
  if (Constants.appOwnership !== 'expo') {
    RNIap = require('react-native-iap');
    isIAPAvailable = true;
    console.log('📦 react-native-iap loaded. Available methods:', Object.keys(RNIap).filter(key => typeof RNIap[key] === 'function').join(', '));
  }
} catch (error) {
  console.log('react-native-iap not available, using mock mode');
  isIAPAvailable = false;
}

// Safe IAP function wrappers
const safeIAPCall = async (fn: () => Promise<any>, fallback: any = null) => {
  if (!isIAPAvailable) {
    console.log('IAP not available, returning fallback');
    return fallback;
  }
  try {
    return await fn();
  } catch (error) {
    console.error('IAP call failed:', error);
    return fallback;
  }
};

// Type definitions
type Product = {
  productId: string;
  price: string;
  currency: string;
  localizedPrice: string;
  title?: string;
  description?: string;
};

type Purchase = {
  transactionReceipt?: string;
  productId: string;
};

type PurchaseError = {
  code: string;
  message: string;
};

type IAPCallbacks = {
  onPurchaseSuccess?: () => void;
  onPurchaseError?: (error: string) => void;
  onRestoreSuccess?: () => void;
  onRestoreError?: (error: string) => void;
};

// Your product IDs from App Store Connect
// NOTE: These should match EXACTLY what's in App Store Connect
// Format is usually: bundleId.productId or just productId
const PRODUCT_IDS = Platform.select({
  ios: [
    'bible.monthly.plan',      // Regular $9.99/month
    'discounted.monthly.plan',  // Discounted $4.99/month
    // If products don't load, try with full bundle ID:
    // 'com.watson.bibleverses.bible.monthly.plan',
    // 'com.watson.bibleverses.discounted.monthly.plan',
  ],
  android: [],
}) || [];

console.log('📋 Product IDs configured:', PRODUCT_IDS);

export const useIAP = (callbacks?: IAPCallbacks) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [connected, setConnected] = useState(false);
  
  // Add timeout ref to prevent stuck purchases
  const purchaseTimeoutRef = useRef<any>(null);

  // Initialize IAP connection
  useEffect(() => {
    let purchaseUpdateSubscription: any;
    let purchaseErrorSubscription: any;

    const initializeIAP = async () => {
      if (!isIAPAvailable) {
        console.log('IAP not available, setting mock connected state');
        setConnected(true); // Set to true so UI isn't blocked
        // Set mock products for testing in Expo Go
        setProducts([
          {
            productId: 'bible.monthly.plan',
            price: '$9.99',
            currency: 'USD',
            localizedPrice: '$9.99',
            title: 'Monthly Plan',
            description: 'Monthly subscription'
          },
          {
            productId: 'discounted.monthly.plan',
            price: '$4.99',
            currency: 'USD',
            localizedPrice: '$4.99',
            title: 'Discounted Plan',
            description: 'Discounted monthly subscription'
          }
        ]);
        return;
      }

      try {
        console.log('🔌 Initializing IAP connection...');
        console.log('📦 react-native-iap version check - methods available:', Object.keys(RNIap).filter(key => typeof RNIap[key] === 'function').slice(0, 10).join(', '));

        const result = await safeIAPCall(() => RNIap.initConnection(), false);
        console.log('✅ IAP connection initialized:', result);
        setConnected(true);

        // Set up purchase listeners FIRST, before fetching products
        console.log('🎧 Setting up purchase listeners...');
        if (RNIap.purchaseUpdatedListener) {
          purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
            async (purchase: any) => {
              console.log('📦 Purchase updated - Full purchase object:', JSON.stringify(purchase, null, 2));
              
              // Log all available properties to understand the structure
              console.log('📋 Purchase properties:', Object.keys(purchase));
              console.log('📋 productId:', purchase.productId);
              console.log('📋 transactionReceipt:', purchase.transactionReceipt);
              console.log('📋 transactionId:', purchase.transactionId);
              console.log('📋 purchaseToken:', purchase.purchaseToken);
              console.log('📋 originalTransactionIdentifierIOS:', purchase.originalTransactionIdentifierIOS);
              
              // Check for various receipt/validation properties
              const hasValidPurchase =
                purchase.productId &&
                (purchase.transactionId ||
                 purchase.originalTransactionIdentifierIOS ||
                 purchase.transactionReceipt);

              console.log('✅ Purchase validation result:', hasValidPurchase);

              if (hasValidPurchase) {
                try {
                  console.log('✅ Valid purchase detected, processing with Supabase...');
                  console.log('🛒 Product ID:', purchase.productId);
                  
                  // Get or create user
                  const user = await getOrCreateUser();

                  if (user) {
                    console.log('👤 User found/created:', user.id);
                    
                    // Process purchase and update Supabase
                    const result = await handlePurchase(user.id, purchase.productId, purchase);
                    
                    if (result.success) {
                      console.log('✅ Purchase processed and synced with Supabase');
                      console.log('📊 Subscription ID:', result.subscription?.id);
                    } else {
                      console.error('❌ Error syncing purchase with Supabase:', result.error);
                    }
                  } else {
                    console.error('❌ Failed to get/create user');
                  }

                  // Finish the transaction
                  console.log('🔄 Finishing transaction...');
                  try {
                    await safeIAPCall(() => RNIap.finishTransaction({
                      purchase,
                      isConsumable: false
                    }));
                    console.log('✅ Transaction finished successfully');
                  } catch (finishError) {
                    console.error('❌ Error finishing transaction:', finishError);
                    // Don't block the user even if finishing fails
                  }

                } catch (error) {
                  console.error('❌ Error processing purchase:', error);
                  console.error('❌ Error details:', JSON.stringify(error, null, 2));
                  
                  Alert.alert(
                    'Purchase Processing Error',
                    'Your purchase was successful but there was an error processing it. Please contact support.',
                    [{ text: 'OK' }]
                  );
                }
                
                // FIX #2: Always clear loading state and timeout for valid purchases
                setIsPurchasing(false);
                
                if (purchaseTimeoutRef.current) {
                  clearTimeout(purchaseTimeoutRef.current);
                  purchaseTimeoutRef.current = null;
                }

                // FIX #3: Always show success and navigate for valid purchases (regardless of Supabase result)
                Alert.alert(
                  'Purchase Successful!',
                  'Thank you for subscribing. Enjoy full access!',
                  [{ text: 'OK', onPress: () => callbacks?.onPurchaseSuccess?.() }]
                );

                // ALWAYS navigate after valid purchase
                callbacks?.onPurchaseSuccess?.();
              } else {
                console.warn('⚠️ Purchase object missing required properties');
                console.warn('⚠️ Purchase object keys:', Object.keys(purchase));
                console.warn('⚠️ This might be a pending or incomplete purchase');
                
                // FIX #2: Add fallback cleanup so UI NEVER gets stuck
                setIsPurchasing(false);

                if (purchaseTimeoutRef.current) {
                  clearTimeout(purchaseTimeoutRef.current);
                  purchaseTimeoutRef.current = null;
                }
              }
            }
          );
        }

        if (RNIap.purchaseErrorListener) {
          purchaseErrorSubscription = RNIap.purchaseErrorListener(
            (error: PurchaseError) => {
              console.error('❌ Purchase error listener triggered');
              console.error('❌ Error code:', error?.code);
              console.error('❌ Error message:', error?.message);
              console.error('❌ Full error:', JSON.stringify(error, null, 2));
              setIsPurchasing(false);

              if (error.code !== 'E_USER_CANCELLED') {
                const errorMessage = error.message || 'Unable to complete purchase. Please try again.';
                Alert.alert(
                  'Purchase Failed',
                  errorMessage,
                  [{ text: 'OK' }]
                );
                callbacks?.onPurchaseError?.(errorMessage);
              } else {
                console.log('ℹ️ User cancelled the purchase');
              }
            }
          );
        }

        console.log('✅ Purchase listeners set up successfully');

        // Now fetch available products AFTER listeners are ready
        await fetchProducts();
      } catch (error) {
        console.error('❌ Failed to initialize IAP:', error);
        console.error('❌ Initialization error details:', JSON.stringify(error, null, 2));
        setConnected(false);
      }
    };

    initializeIAP();

    // Cleanup on unmount
    return () => {
      if (purchaseUpdateSubscription && purchaseUpdateSubscription.remove) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription && purchaseErrorSubscription.remove) {
        purchaseErrorSubscription.remove();
      }
      if (isIAPAvailable && RNIap.endConnection) {
        safeIAPCall(() => RNIap.endConnection());
      }
    };
  }, []);

  // Fetch available products
  const fetchProducts = async () => {
    if (!isIAPAvailable) {
      console.log('IAP not available, using mock products');
      return;
    }

    try {
      console.log('🛍️ Fetching products with IDs:', PRODUCT_IDS);
      console.log('🔍 RNIap.fetchProducts exists?', typeof RNIap.fetchProducts);

      // v14 API: Use fetchProducts with type: 'subs' for subscriptions
      let availableProducts = [];

      try {
        console.log('📲 Attempting fetchProducts...');
        availableProducts = await RNIap.fetchProducts({
          skus: PRODUCT_IDS,
          type: 'subs', // 'subs' for subscriptions, 'in-app' for products, 'all' for both
        });
        console.log('✅ fetchProducts succeeded!');
      } catch (fetchError: any) {
        console.error('❌ fetchProducts failed:', fetchError?.message);
        console.error('❌ Trying with type: "all" instead...');

        try {
          availableProducts = await RNIap.fetchProducts({
            skus: PRODUCT_IDS,
            type: 'all',
          });
          console.log('✅ fetchProducts with type: "all" succeeded!');
        } catch (allError: any) {
          console.error('❌ Both attempts failed:', allError?.message);
          throw allError;
        }
      }

      console.log('✅ Products fetched successfully:', JSON.stringify(availableProducts, null, 2));
      console.log('📊 Number of products:', availableProducts?.length || 0);

      if (availableProducts && availableProducts.length > 0) {
        setProducts(availableProducts);
        console.log('✅ Products set in state');
      } else {
        console.warn('⚠️ No products returned from App Store. Check:');
        console.warn('  1. Product IDs match App Store Connect');
        console.warn('  2. Products are approved and available');
        console.warn('  3. Correct bundle ID and certificates');
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
    }
  };

  // Purchase a product
  const purchaseProduct = useCallback(async (productId: string) => {
    console.log('🛒 purchaseProduct called with productId:', productId);

    if (!connected) {
      const errorMsg = 'Store connection not ready. Please try again.';
      console.error('❌', errorMsg);
      Alert.alert('Error', errorMsg);
      callbacks?.onPurchaseError?.(errorMsg);
      throw new Error(errorMsg);
    }

    if (isPurchasing) {
      const errorMsg = 'A purchase is already in progress.';
      console.error('❌', errorMsg);
      Alert.alert('Please Wait', errorMsg);
      callbacks?.onPurchaseError?.(errorMsg);
      throw new Error(errorMsg);
    }

    // Handle mock purchases in Expo Go
    if (!isIAPAvailable) {
      console.log('🛒 Mock purchase for:', productId);
      setIsPurchasing(true);
      
      // Simulate purchase process with database update
      setTimeout(async () => {
        try {
          // Create mock purchase data
          const mockPurchase = {
            productId: productId,
            transactionId: `mock_txn_${Date.now()}`,
            transactionDate: new Date().toISOString(),
            transactionReceipt: 'mock_receipt_data_expo_go'
          };

          console.log('📦 Mock purchase created:', mockPurchase);

          // Get or create user
          const user = await getOrCreateUser();

          if (user) {
            console.log('🔄 Processing mock purchase with Supabase...');
            
            // Process purchase and update Supabase
            const result = await handlePurchase(user.id, productId, mockPurchase);
            
            if (result.success) {
              console.log('✅ Mock purchase processed and synced with Supabase');
              console.log('📊 Subscription created:', result.subscription?.id);
            } else {
              console.error('❌ Error syncing mock purchase with Supabase:', result.error);
            }
          }

          setIsPurchasing(false);
          Alert.alert(
            'Mock Purchase Successful!',
            'This is a mock purchase for Expo Go testing. The subscription has been added to your database!',
            [{ text: 'OK', onPress: () => callbacks?.onPurchaseSuccess?.() }]
          );
          // Call success callback for mock purchase
          callbacks?.onPurchaseSuccess?.();
        } catch (error) {
          console.error('❌ Error processing mock purchase:', error);
          setIsPurchasing(false);
          Alert.alert(
            'Mock Purchase Error',
            'Failed to process mock purchase. Please check the console.',
            [{ text: 'OK' }]
          );
        }
      }, 2000);
      return;
    }

    try {
      console.log('🛒 Initiating purchase for:', productId);
      console.log('📱 Platform:', Platform.OS);
      console.log('🔍 RNIap methods available:', Object.keys(RNIap).filter(key => typeof RNIap[key] === 'function').slice(0, 15).join(', '));
      console.log('🔍 RNIap.requestPurchase exists?', typeof RNIap.requestPurchase);

      setIsPurchasing(true);
      
      // Clear any existing timeout
      if (purchaseTimeoutRef.current) {
        clearTimeout(purchaseTimeoutRef.current);
      }
      
      // Set timeout to prevent stuck purchases (30 seconds)
      purchaseTimeoutRef.current = setTimeout(() => {
        console.warn('⏰ Purchase timeout - clearing stuck state');
        setIsPurchasing(false);
        Alert.alert(
          'Purchase Timeout',
          'The purchase is taking longer than expected. Please check your App Store account or try again.',
          [{ text: 'OK' }]
        );
      }, 30000);

      // v14 API: Use requestPurchase for BOTH products and subscriptions
      // The difference is the 'type' parameter: 'subs' for subscriptions, 'in-app' for products
      const purchaseConfig = Platform.OS === 'ios'
        ? {
            type: 'subs' as const,
            request: {
              ios: {
                sku: productId,
              },
            },
          }
        : {
            type: 'subs' as const,
            request: {
              android: {
                skus: [productId],
              },
            },
          };

      console.log('📲 [v14 API] Calling requestPurchase with config:', JSON.stringify(purchaseConfig, null, 2));

      try {
        const result = await RNIap.requestPurchase(purchaseConfig);
        console.log('✅ requestPurchase result:', result);
      } catch (reqError: any) {
        console.error('❌ requestPurchase threw error:', reqError);
        console.error('❌ Error name:', reqError?.name);
        console.error('❌ Error message:', reqError?.message);
        console.error('❌ Error code:', reqError?.code);
        throw reqError;
      }

      console.log('✅ requestPurchase call completed');
    } catch (error: any) {
      console.error('❌ Purchase request failed:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      setIsPurchasing(false);
      
      // Clear purchase timeout
      if (purchaseTimeoutRef.current) {
        clearTimeout(purchaseTimeoutRef.current);
        purchaseTimeoutRef.current = null;
      }

      if (error.code !== 'E_USER_CANCELLED') {
        const errorMessage = 'Unable to start purchase. Please try again.';
        Alert.alert(
          'Purchase Error',
          errorMessage,
          [{ text: 'OK' }]
        );
        callbacks?.onPurchaseError?.(errorMessage);
      }
    }
  }, [connected, isPurchasing]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    if (!connected) {
      Alert.alert('Error', 'Store connection not ready. Please try again.');
      return;
    }

    // Handle mock restore in Expo Go
    if (!isIAPAvailable) {
      console.log('🔄 Mock restore purchases...');
      setIsRestoring(true);
      
      setTimeout(async () => {
        try {
          // Get or create user
          const user = await getOrCreateUser();

          if (user) {
            console.log('🔍 Checking for existing subscriptions to restore...');
            
            // Check if user already has subscriptions in the database
            const { data: existingSubs } = await supabase
              .from('subscriptions')
              .select('*')
              .eq('user_id', user.id);

            if (existingSubs && existingSubs.length > 0) {
              console.log(`📱 Found ${existingSubs.length} existing subscriptions to restore`);
              Alert.alert(
                'Restore Successful',
                `Found ${existingSubs.length} existing subscription(s) in your account!`,
                [{ text: 'OK', onPress: () => callbacks?.onRestoreSuccess?.() }]
              );
            } else {
              console.log('📭 No existing subscriptions found');
              Alert.alert(
                'No Purchases Found',
                'No previous subscriptions were found for this account in Expo Go testing.',
                [{ text: 'OK' }]
              );
            }
          }

          setIsRestoring(false);
          // Call success callback for mock restore
          callbacks?.onRestoreSuccess?.();
        } catch (error) {
          console.error('❌ Error during mock restore:', error);
          setIsRestoring(false);
          Alert.alert(
            'Restore Error',
            'Failed to check existing subscriptions. Please check the console.',
            [{ text: 'OK' }]
          );
        }
      }, 1500);
      return;
    }

    try {
      console.log('🔄 Restoring purchases...');
      setIsRestoring(true);

      const purchases = await safeIAPCall(() => RNIap.getAvailablePurchases(), []);
      console.log('📦 Available purchases:', purchases);

      if (purchases && purchases.length > 0) {
        // Get or create user
        const user = await getOrCreateUser();

        if (user) {
          // Process restored purchases with Supabase
          const result = await handleRestorePurchases(user.id, purchases);
          
          if (result.success) {
            console.log(`✅ Restored ${result.restoredCount} subscriptions`);
          } else {
            console.error('❌ Error syncing restored purchases:', result.error);
          }
        }

        // Finish any unfinished transactions
        for (const purchase of purchases) {
          await safeIAPCall(() => RNIap.finishTransaction({ purchase, isConsumable: false }));
        }

        Alert.alert(
          'Restore Successful',
          `Your ${purchases.length} purchase(s) have been restored!`,
          [{ text: 'OK', onPress: () => callbacks?.onRestoreSuccess?.() }]
        );

        // Call success callback
        callbacks?.onRestoreSuccess?.();
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.',
          [{ text: 'OK' }]
        );
      }

      setIsRestoring(false);
    } catch (error) {
      console.error('❌ Restore purchases error:', error);
      setIsRestoring(false);
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [connected]);

  // Get product by ID
  const getProductById = useCallback((productId: string) => {
    return products.find(p => p.productId === productId);
  }, [products]);

  return {
    products,
    isPurchasing,
    isRestoring,
    connected,
    purchaseProduct,
    restorePurchases,
    getProductById,
    isIAPAvailable, // Export this so components can check if IAP is available
  };
};
