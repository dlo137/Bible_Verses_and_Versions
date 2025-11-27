import { useEffect, useState, useCallback } from 'react';
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
const PRODUCT_IDS = Platform.select({
  ios: [
    'bible.monthly.plan',      // Regular $9.99/month
    'discounted.monthly.plan',  // Discounted $4.99/month
  ],
  android: [],
}) || [];

export const useIAP = (callbacks?: IAPCallbacks) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [connected, setConnected] = useState(false);

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
        const result = await safeIAPCall(() => RNIap.initConnection(), false);
        console.log('✅ IAP connection initialized:', result);
        setConnected(true);

        // Fetch available products
        await fetchProducts();

        // Set up purchase listeners
        if (RNIap.purchaseUpdatedListener) {
          purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
            async (purchase: Purchase) => {
              console.log('📦 Purchase updated:', purchase);
              const receipt = purchase.transactionReceipt;

              if (receipt) {
                try {
                  console.log('✅ Purchase successful, processing with Supabase...');
                  
                  // Get or create user
                  const user = await getOrCreateUser();

                  if (user) {
                    // Process purchase and update Supabase
                    const result = await handlePurchase(user.id, purchase.productId, purchase);
                    
                    if (result.success) {
                      console.log('✅ Purchase processed and synced with Supabase');
                    } else {
                      console.error('❌ Error syncing purchase with Supabase:', result.error);
                    }
                  }

                  // Finish the transaction
                  await safeIAPCall(() => RNIap.finishTransaction({ purchase, isConsumable: false }));

                  console.log('✅ Transaction finished successfully');
                  setIsPurchasing(false);

                  // Grant access to user
                  Alert.alert(
                    'Purchase Successful!',
                    'Thank you for subscribing. Enjoy full access!',
                    [{ text: 'OK', onPress: () => callbacks?.onPurchaseSuccess?.() }]
                  );

                  // Call success callback
                  callbacks?.onPurchaseSuccess?.();
                } catch (error) {
                  console.error('❌ Error finishing transaction:', error);
                  setIsPurchasing(false);
                }
              }
            }
          );
        }

        if (RNIap.purchaseErrorListener) {
          purchaseErrorSubscription = RNIap.purchaseErrorListener(
            (error: PurchaseError) => {
              console.error('❌ Purchase error:', error);
              setIsPurchasing(false);

              if (error.code !== 'E_USER_CANCELLED') {
                const errorMessage = error.message || 'Unable to complete purchase. Please try again.';
                Alert.alert(
                  'Purchase Failed',
                  errorMessage,
                  [{ text: 'OK' }]
                );
                callbacks?.onPurchaseError?.(errorMessage);
              }
            }
          );
        }
      } catch (error) {
        console.error('❌ Failed to initialize IAP:', error);
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
      console.log('🛍️ Fetching products:', PRODUCT_IDS);
      const availableProducts = await safeIAPCall(
        () => RNIap.getProducts({ skus: PRODUCT_IDS }),
        []
      );
      console.log('✅ Products fetched:', availableProducts);
      setProducts(availableProducts);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  // Purchase a product
  const purchaseProduct = useCallback(async (productId: string) => {
    if (!connected) {
      Alert.alert('Error', 'Store connection not ready. Please try again.');
      return;
    }

    if (isPurchasing) {
      Alert.alert('Please Wait', 'A purchase is already in progress.');
      return;
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
      setIsPurchasing(true);

      await safeIAPCall(() => RNIap.requestPurchase({
        sku: productId,
        ...(Platform.OS === 'android' && {
          subscriptionOffers: [
            {
              sku: productId,
              offerToken: '', // Android specific - will be needed for Android implementation
            },
          ],
        }),
      }));
    } catch (error: any) {
      console.error('❌ Purchase request failed:', error);
      setIsPurchasing(false);

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
