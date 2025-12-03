import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Modal, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { getBibleSongs } from '../../lib/supabase';
import { useIAP } from '../../hooks/useIAP';
import NotificationService from '../../services/NotificationService';
import { markOnboardingComplete } from '../../utils/onboarding';

export default function Plans() {
  const router = useRouter();
  const { songs, setSongs, playSong } = useAudio();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [iapReady, setIapReady] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [currentPurchaseAttempt, setCurrentPurchaseAttempt] = useState<'regular' | 'discount' | null>(null);
  const hasInitializedRef = useRef(false);

  // Check if notifications are available
  const isNotificationsAvailable = NotificationService.isAvailable();

  // IAP hook
  const {
    products,
    isPurchasing,
    isRestoring,
    connected,
    purchaseProduct,
    restorePurchases,
    getProductById,
    isIAPAvailable,
  } = useIAP({
    onPurchaseSuccess: async () => {
      await markOnboardingComplete();
      setCurrentPurchaseAttempt(null); // Clear loading state
      // Navigate to verses tab after successful purchase
      router.push('/(tabs)/verses');
    },
    onPurchaseError: (error) => {
      setCurrentPurchaseAttempt(null); // Clear loading state on error
      // User stays on plans screen - no navigation
    },
    onRestoreSuccess: async () => {
      await markOnboardingComplete();
      // Navigate to verses tab after successful restore
      router.push('/(tabs)/verses');
    },
    onRestoreError: (error) => {
      // User stays on plans screen - no navigation
    }
  });

  // Initialize IAP on mount
  useEffect(() => {
    const initializeIAP = async () => {
      if (hasInitializedRef.current) {
        console.log('Already initialized');
        return;
      }

      hasInitializedRef.current = true;
      console.log('🔄 Initializing IAP...');
      console.log('🔍 IAP Available:', isIAPAvailable);
      
      try {
        setLoadingProducts(true);
        // Add a small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIapReady(true);
        console.log('✅ IAP initialized successfully');
        
        // In Expo Go, we're ready to use mock purchases
        if (!isIAPAvailable) {
          console.log('📱 Running in Expo Go - mock purchases enabled');
        }
      } catch (error) {
        console.error('❌ IAP initialization failed:', error);
        setIapReady(true); // Set ready anyway to unblock UI
      } finally {
        setLoadingProducts(false);
      }
    };

    initializeIAP();

    // Fallback timeout to unblock UI
    const timeout = setTimeout(() => {
      setIapReady(true);
      setLoadingProducts(false);
      console.log('⏰ IAP initialization timeout - unblocking button');
    }, 3000); // Reduced timeout

    return () => clearTimeout(timeout);
  }, [isIAPAvailable]);

  // Glow animation loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2250,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2250,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Interpolate glow animation to border color and shadow
  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#DAA520', '#FFF700'],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 20],
  });

  // Load and start playing music on mount if not already playing
  useEffect(() => {
    const loadMusic = async () => {
      if (songs.length === 0) {
        // Load all songs from Supabase
        const songList = await getBibleSongs();
        console.log('Loading songs on plans screen:', songList);

        if (songList.length > 0) {
          setSongs(songList);
          // Start playing a random song
          const randomIndex = Math.floor(Math.random() * songList.length);
          playSong(randomIndex);
        }
      }
      // If songs are already loaded, they continue playing automatically
    };

    loadMusic();
  }, []);

  const handlePurchase = async () => {
    if (!iapReady || loadingProducts) {
      console.log('🚫 IAP not ready yet');
      return;
    }

    console.log('🛒 Regular plan purchase clicked');
    console.log('📦 Available products:', products);
    console.log('🔗 Connected:', connected);
    console.log('⚡ IAP Ready:', iapReady);
    console.log('🔍 IAP Available:', isIAPAvailable);

    // Set loading state BEFORE starting purchase
    setCurrentPurchaseAttempt('regular');

    try {
      // Purchase the regular plan (bible.monthly.plan - $9.99)
      // This will trigger mock purchase in Expo Go automatically
      await purchaseProduct('bible.monthly.plan');
      // Navigation will happen in success callback
    } catch (error) {
      console.error('❌ Purchase error:', error);
      setCurrentPurchaseAttempt(null); // Clear loading state on error
    }
  };

  const handleClose = () => {
    setShowDiscountModal(true);
  };

  const handleDiscountAccept = async () => {
    if (!iapReady || loadingProducts) {
      console.log('🚫 IAP not ready yet');
      return;
    }

    console.log('🛒 Discount plan purchase clicked');
    console.log('📦 Available products:', products);
    console.log('🔗 Connected:', connected);
    console.log('⚡ IAP Ready:', iapReady);
    console.log('🔍 IAP Available:', isIAPAvailable);

    setShowDiscountModal(false);

    // Set loading state BEFORE starting purchase
    setCurrentPurchaseAttempt('discount');

    try {
      // Purchase the discounted plan (discounted.monthly.plan - $4.99)
      // This will trigger mock purchase in Expo Go automatically
      await purchaseProduct('discounted.monthly.plan');
      // Navigation will happen in success callback
    } catch (error) {
      console.error('❌ Discount purchase error:', error);
      setCurrentPurchaseAttempt(null); // Clear loading state on error
    }
  };

  const handleDiscountDecline = () => {
    setShowDiscountModal(false);
    router.back();
  };

  const handleRestorePurchase = async () => {
    console.log('🔄 Restore purchase clicked');
    await restorePurchases();
  };

  // Handle legal links
  const openTermsOfUse = () => {
    Linking.openURL('https://www.apple.com/legal/internet-services/terms/site.html');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://dlo137.github.io/Bible_Support-Privacy_Page/');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/onboarding/main-bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="#888888" />
      </TouchableOpacity>

      {/* Restore Purchase Button */}
      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestorePurchase}
        disabled={isRestoring || !connected}
      >
        {isRestoring ? (
          <ActivityIndicator size="small" color="#888888" />
        ) : (
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Top Section */}
        <View style={styles.topSection}>
          {/* App Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.appIcon}
            />
          </View>

          {/* Title */}
          <Text style={styles.appTitle}>Strengthen Your Faith Every Day</Text>
          <Text style={styles.subtitle}>Simple verses to guide you</Text>

          {/* Benefits List */}
          <View style={styles.benefitsList}>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Daily uplifting Bible guidance</Text>
            </View>

           <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Build a consistent scripture habit</Text>
            </View>


            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Simple, peaceful designs for focused reading</Text>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Entire Bible, KJV and ASV versions</Text>
            </View>
          </View>

        </View>

        {/* Bottom Section - Pricing Card */}
        <View style={styles.bottomSection}>
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              styles.selectedPlan,
            ]}
            activeOpacity={1}
          >
            <View style={styles.planRadio}>
              <View style={styles.planRadioSelected} />
            </View>
            <View style={styles.planContent}>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planContentSubtext}>3 Day Free Trial</Text>
            </View>
            <View style={styles.planPricing}>
              <Text style={styles.planPrice}>$9.99/month</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Get Started Button - Below Cards */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.getStartedButton, (!iapReady || loadingProducts || isPurchasing) && { opacity: 0.6 }]}
            onPress={handlePurchase}
            disabled={!iapReady || loadingProducts || isPurchasing}
          >
            {(loadingProducts || isPurchasing) ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.getStartedButtonText}>
                {!iapReady ? 'CONNECTING...' : 'GET STARTED'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Legal Links */}
        <View style={styles.legalContainer}>
          <TouchableOpacity onPress={openTermsOfUse} style={styles.legalButton}>
            <Text style={styles.legalText}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.legalSeparator}> • </Text>
          <TouchableOpacity onPress={openPrivacyPolicy} style={styles.legalButton}>
            <Text style={styles.legalText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Discount Modal */}
      <Modal
        visible={showDiscountModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDiscountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalBadge}>EXCLUSIVE OFFER</Text>
              <View style={styles.modalDiscountBadge}>
                <Text style={styles.modalDiscountBadgeText}>50% OFF</Text>
              </View>
              <Text style={styles.modalTrialBadge}>3-DAY FREE TRIAL</Text>
            </View>

            <Text style={styles.modalTitle}>Special Pricing</Text>

            {/* Price - Most Prominent */}
            <View style={styles.modalPricing}>
              <Text style={styles.modalPriceOld}>$9.99</Text>
              <Text style={styles.modalPriceNew}>$4.99</Text>
              <Text style={styles.modalPriceSubtext}>/month</Text>
            </View>

            {/* Auto-renew notice */}
            <Text style={styles.modalAutoRenew}>Auto-renews after free trial. Cancel anytime.</Text>

            <TouchableOpacity
              style={styles.modalAcceptButton}
              onPress={handleDiscountAccept}
              disabled={!iapReady || loadingProducts || !!currentPurchaseAttempt || isPurchasing}
            >
              {(loadingProducts || currentPurchaseAttempt || isPurchasing) ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalAcceptText}>TRY FREE & SUBSCRIBE</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalDeclineButton} onPress={handleDiscountDecline}>
              <Text style={styles.modalDeclineText}>No thanks, I'll pass</Text>
            </TouchableOpacity>

            {/* Legal Links */}
            <View style={styles.legalContainer}>
              <TouchableOpacity onPress={openTermsOfUse} style={styles.legalButton}>
                <Text style={styles.legalText}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}> • </Text>
              <TouchableOpacity onPress={openPrivacyPolicy} style={styles.legalButton}>
                <Text style={styles.legalText}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  restoreButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restoreButtonText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  topSection: {
    width: '100%',
    flex: 1,
    minHeight: 200,
    paddingBottom: 60,
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 16,
    marginTop: 80,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  freeTrialBadge: {
    position: 'absolute',
    top: -12,
    left: -2,
    backgroundColor: '#DAA520',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  freeTrialBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  selectedPlan: {
    borderColor: '#DAA520',
    backgroundColor: 'rgba(218, 165, 32, 0.1)',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 4,
  },
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#a0a8b8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  planRadioSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DAA520',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  planContentSubtext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#ffffff',
    marginTop: 0,
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a0a8b8',
  },
  planSubtext: {
    fontSize: 12,
    color: '#a0a8b8',
    opacity: 0.7,
    marginTop: 2,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  getStartedButton: {
    backgroundColor: '#DAA520',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#DAA520',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 15,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 6,
  },
  subtitle: {
    color: '#5A5A5A',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 1,
    marginBottom: 32,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    maxWidth: '80%',
  },
  benefitIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 22,
  },
  timelineContainer: {
    width: '100%',
    marginBottom: 40,
    alignItems: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
    width: '100%',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flexShrink: 1,
  },
  timelineTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineDesc: {
    color: '#5A5A5A',
    fontSize: 14,
    lineHeight: 20,
  },
  timelineDescWhite: {
    color: '#3A3A3A',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 18,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    marginBottom: 16,
  },
  freeTrialBadge: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  freeTrialText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 3,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  planLeftColumn: {
    flexDirection: 'column',
    flex: 1,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  planPrice: {
    fontSize: 13,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  planSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#DAA520',
    letterSpacing: 2,
    marginBottom: 12,
  },
  modalDiscountBadge: {
    backgroundColor: '#DAA520',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 8,
  },
  modalDiscountBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  modalTrialBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#888888',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalPriceOld: {
    fontSize: 22,
    fontWeight: '500',
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  modalPriceNew: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  modalPriceSubtext: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5A5A5A',
    marginLeft: 4,
  },
  modalAutoRenew: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  modalAcceptButton: {
    backgroundColor: '#DAA520',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAcceptText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalDeclineButton: {
    paddingVertical: 12,
  },
  modalDeclineText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '400',
  },
  legalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  legalButton: {
    padding: 4,
  },
  legalText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
  },
});
