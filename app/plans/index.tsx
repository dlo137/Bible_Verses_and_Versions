import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated, Modal, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { getBibleSongs } from '../../lib/supabase';
import { useIAP } from '../../hooks/useIAP';
import NotificationService from '../../services/NotificationService';
import { SubscriptionDebugPanel } from '../../components/SubscriptionDebugPanel';

export default function Plans() {
  const router = useRouter();
  const { songs, setSongs, playSong } = useAudio();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [showDiscountModal, setShowDiscountModal] = useState(false);

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
    onPurchaseSuccess: () => {
      console.log('✅ Purchase successful, navigating to verses...');
      // Navigate to verses tab after successful purchase
      router.push('/(tabs)/verses');
    },
    onPurchaseError: (error) => {
      console.error('❌ Purchase failed:', error);
      // User stays on plans screen - no navigation
    },
    onRestoreSuccess: () => {
      console.log('✅ Restore successful, navigating to verses...');
      // Navigate to verses tab after successful restore
      router.push('/(tabs)/verses');
    },
    onRestoreError: (error) => {
      console.error('❌ Restore failed:', error);
      // User stays on plans screen - no navigation
    }
  });

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
    console.log('🛒 Regular plan purchase clicked');
    console.log('📦 Available products:', products);

    // Purchase the regular plan (bible.monthly.plan - $9.99)
    await purchaseProduct('bible.monthly.plan');

    // Navigation will happen after successful purchase in the useIAP hook
    // The purchase listener will show success alert and then we navigate
  };

  const handleClose = () => {
    setShowDiscountModal(true);
  };

  const handleDiscountAccept = async () => {
    console.log('🛒 Discount plan purchase clicked');
    console.log('📦 Available products:', products);

    setShowDiscountModal(false);

    // Purchase the discounted plan (discounted.monthly.plan - $4.99)
    await purchaseProduct('discounted.monthly.plan');

    // Navigation will happen after successful purchase in the useIAP hook
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

      {/* Debug Panel for Expo Go Testing */}
      {!isIAPAvailable && <SubscriptionDebugPanel />}

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
          <Text style={styles.subtitle}>Clear, simple verses to guide you</Text>

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

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* CTA Block */}
          <Animated.View
            style={[
              styles.ctaBlock,
              {
                borderColor,
                shadowColor: '#FFD700',
                shadowOpacity,
                shadowRadius,
                shadowOffset: { width: 0, height: 0 },
                elevation: 15,
              }
            ]}
          >
            <TouchableOpacity
              style={styles.ctaBlockInner}
              onPress={handlePurchase}
              disabled={isPurchasing || !connected}
            >
              {isPurchasing ? (
                <ActivityIndicator size="large" color="#DAA520" />
              ) : (
                <>
                  <Text style={styles.ctaMainText}>
                    {!isIAPAvailable ? 'Start FREE Trial (Demo)' : 'Start FREE Trial'}
                  </Text>
                  <Text style={styles.ctaTrialText}>3 day free trial • $9.99/month after</Text>
                  <Text style={styles.ctaCancelText}>
                    {!isIAPAvailable 
                      ? 'Demo mode in Expo Go. Real purchases work in production.'
                      : !isNotificationsAvailable
                      ? 'Full features available in production builds.'
                      : 'No commitment. Cancel anytime.'
                    }
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
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
              <Text style={styles.modalDiscount}>50% OFF</Text>
            </View>

            <Text style={styles.modalTitle}>Wait! Don't Miss This</Text>
            <Text style={styles.modalSubtitle}>Start with a 3 day free trial, then just</Text>

            <View style={styles.modalPricing}>
              <Text style={styles.modalPriceOld}>$9.99</Text>
              <Text style={styles.modalPriceNew}>$4.99</Text>
              <Text style={styles.modalPriceSubtext}>/month</Text>
            </View>

            <Text style={styles.modalFeatures}>3 day free trial • All features • Cancel anytime</Text>

            <TouchableOpacity
              style={styles.modalAcceptButton}
              onPress={handleDiscountAccept}
              disabled={isPurchasing || !connected}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalAcceptText}>Claim 50% Off</Text>
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
    paddingTop: 70,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topSection: {
    width: '100%',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
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
    fontSize: 14,
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
  ctaBlock: {
    borderRadius: 30,
    borderWidth: 3,
    width: '92%',
    alignSelf: 'center',
  },
  ctaBlockInner: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
  },
  ctaMainText: {
    color: '#DAA520',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 10,
  },
  ctaTrialText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaCancelText: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
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
    fontSize: 11,
    fontWeight: '700',
    color: '#DAA520',
    letterSpacing: 2,
    marginBottom: 8,
  },
  modalDiscount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#DAA520',
    letterSpacing: -1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalPriceOld: {
    fontSize: 24,
    fontWeight: '500',
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  modalPriceNew: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  modalPriceSubtext: {
    fontSize: 18,
    fontWeight: '400',
    color: '#5A5A5A',
    marginLeft: 4,
  },
  modalFeatures: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 24,
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
