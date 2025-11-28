import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Platform, Modal, TouchableWithoutFeedback, Keyboard, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIAP } from '../../hooks/useIAP';
import { resetOnboarding } from '../../utils/onboarding';
import { getOrCreateUser } from '../../lib/authHelper';

export default function ProfileScreen() {
  const router = useRouter();
  const storeUrl = Platform.OS === 'android'
    ? 'https://play.google.com/store/apps/details?id=com.yourbibleapp'
    : 'https://apps.apple.com/app/idYOURAPPID?action=write-review';

  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // IAP hook for restore purchases functionality
  const { 
    isRestoring, 
    restorePurchases,
    isIAPAvailable 
  } = useIAP({
    onRestoreSuccess: () => {
      console.log('✅ Restore successful from profile screen');
      // Navigate to verses tab after user acknowledges the success alert
      router.push('/(tabs)/verses');
    },
    onRestoreError: (error) => {
      console.error('❌ Restore failed from profile screen:', error);
      // User stays on profile screen
    }
  });

  const settings = [
    { id: 'music', title: 'Music', subtitle: 'Browse and play songs', icon: 'musical-notes' },
    { id: 'share', title: 'Share', subtitle: 'Share this app with friends', icon: 'share-social' },
    { id: 'subscription', title: 'Manage Subscription', subtitle: 'View and manage your plan', icon: 'card' },
    { 
      id: 'restore', 
      title: 'Restore Purchases', 
      subtitle: isRestoring ? 'Restoring...' : 'Restore previous purchases', 
      icon: 'refresh' 
    },
    // { id: 'review', title: 'Write a Review', subtitle: 'Rate us on the App Store', icon: 'star' },
    { id: 'terms', title: 'Terms of Use', subtitle: 'Read our terms and conditions', icon: 'document-text' },
    { id: 'privacy', title: 'Privacy Policy', subtitle: 'How we protect your data', icon: 'shield-checkmark' },
    { id: 'about', title: 'About', subtitle: 'App information', icon: 'information-circle' },
  ];

  const handleMusicPress = () => {
    router.push('/(tabs)/songs');
  };

  const handleShareApp = async () => {
    try {
      const shareUrl = Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/idYOURAPPID'
        : 'https://play.google.com/store/apps/details?id=com.yourbibleapp';

      await Share.share({
        message: `Check out this amazing Bible app! ${shareUrl}`,
        title: 'Holy Bible Verse',
        url: shareUrl, // iOS only
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };

  const handleManageSubscription = () => {
    const subscriptionUrl = Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';

    Linking.openURL(subscriptionUrl);
  };

  const handleRestorePurchases = async () => {
    if (!isIAPAvailable) {
      Alert.alert(
        'Demo Mode',
        'This is demo mode in Expo Go. In production, this would restore your actual purchases.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Restore Purchases',
      'This will restore any previous purchases you made with your Apple ID or Google account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await restorePurchases();
            } catch (error) {
              console.error('Error restoring purchases:', error);
              Alert.alert(
                'Restore Failed', 
                'Unable to restore purchases. Please try again or contact support if the problem persists.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  const handleRateApp = () => {
    Linking.openURL(storeUrl);
  };

  const handleTermsOfUse = () => {
    Linking.openURL('https://www.apple.com/legal/internet-services/terms/site.html');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://dlo137.github.io/Bible_Support-Privacy_Page/');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? You will need to go through onboarding again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'This is your final warning. Your account and all associated data will be permanently deleted. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      console.log('🗑️ Starting account deletion process');

                      // Get or create user (handles anonymous auth)
                      const user = await getOrCreateUser();

                      if (!user) {
                        console.error('❌ No user found');
                        throw new Error('Unable to authenticate user');
                      }

                      console.log('👤 User ID:', user.id);
                      console.log('📞 Calling delete-user-data function');

                      const { data, error } = await supabase.functions.invoke('delete-user-data', {
                        body: { userId: user.id }
                      });

                      console.log('📥 Function response:', JSON.stringify({ data, error }, null, 2));

                      if (error) {
                        console.error('❌ Function returned error:', error);
                        throw error;
                      }

                      // Check if the response indicates failure
                      if (data && !data.success) {
                        console.error('❌ Function returned unsuccessful response:', data);
                        throw new Error(data.error || 'Unknown error from function');
                      }

                      console.log('✅ Data deletion successful, resetting onboarding');
                      await resetOnboarding();

                      Alert.alert(
                        'Account Deleted',
                        'Your account data has been deleted successfully.',
                        [
                          {
                            text: 'OK',
                            onPress: () => router.replace('/')
                          }
                        ]
                      );
                    } catch (error) {
                      console.error('❌ Account deletion error:', error);
                      Alert.alert(
                        'Deletion Failed',
                        `There was an error deleting your account data: ${error.message || 'Unknown error'}. Please try again or contact support.`,
                        [{ text: 'OK' }]
                      );
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      Alert.alert('Incomplete Form', 'Please fill in all fields before submitting.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message,
        },
      });

      if (error) {
        console.error('Error sending email:', error);
        Alert.alert('Error', 'Failed to send message. Please try again later.');
        return;
      }

      Alert.alert(
        'Message Sent!',
        'Thank you for your feedback. We\'ll get back to you as soon as possible.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsContactModalVisible(false);
              setContactForm({ name: '', email: '', subject: '', message: '' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting contact form:', error);
      Alert.alert('Error', 'Failed to send message. Please try again later.');
    }
  };

  const handleSettingPress = (settingId: string) => {
    switch (settingId) {
      case 'music':
        handleMusicPress();
        break;
      case 'share':
        handleShareApp();
        break;
      case 'subscription':
        handleManageSubscription();
        break;
      case 'restore':
        handleRestorePurchases();
        break;
      // case 'review':
      //   handleRateApp();
      //   break;
      case 'terms':
        handleTermsOfUse();
        break;
      case 'privacy':
        handlePrivacyPolicy();
        break;
      case 'about':
        setIsAboutModalVisible(true);
        break;
      case 'logout':
        handleLogout();
        break;
      case 'delete':
        handleDeleteAccount();
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>B</Text>
          </View>
          <Text style={styles.appName}>Holy Bible Verses</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={[
                styles.settingItem,
                setting.id === 'restore' && isRestoring && styles.settingItemDisabled
              ]}
              onPress={() => handleSettingPress(setting.id)}
              disabled={setting.id === 'restore' && isRestoring}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={setting.icon as any} size={24} color="#C9A227" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={[
                  styles.settingSubtitle,
                  setting.id === 'restore' && isRestoring && styles.settingSubtitleRestoring
                ]}>
                  {setting.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Section with Danger Zone */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Log Out Button */}
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={() => handleSettingPress('logout')}
          >
            <View style={styles.dangerIconContainer}>
              <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.dangerTitle}>Log Out</Text>
              <Text style={styles.settingSubtitle}>Sign out of your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.dangerItem}
            onPress={() => handleSettingPress('delete')}
          >
            <View style={styles.dangerIconContainer}>
              <Ionicons name="trash-outline" size={24} color="#E74C3C" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* About Modal */}
      <Modal
        visible={isAboutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.aboutModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.aboutTitle}>About Bible App</Text>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutHeading}>Our Mission</Text>
                <Text style={styles.aboutText}>
                  We're dedicated to making God's Word accessible and engaging for everyone.
                  Our goal is to help you grow in your faith through daily Scripture reading,
                  beautiful verse presentations, and tools to save and reflect on meaningful passages.
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutHeading}>Features</Text>
                <Text style={styles.aboutText}>
                  • Daily verse inspiration with beautiful backgrounds{'\n'}
                  • Search verses by keyword, book, or reference{'\n'}
                  • Save your favorite verses{'\n'}
                  • Multiple Bible translations{'\n'}
                  • Read the full Bible text
                </Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutHeading}>Version</Text>
                <Text style={styles.aboutText}>1.0.0</Text>
              </View>

              <View style={styles.aboutSection}>
                <Text style={styles.aboutHeading}>Contact</Text>
                <Text style={styles.aboutText}>
                  Have feedback or suggestions? We'd love to hear from you.
                  Use the Help & Support option to reach out to us.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.aboutCloseButton}
              onPress={() => setIsAboutModalVisible(false)}
            >
              <Text style={styles.aboutCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Contact Form Modal */}
      <Modal
        visible={isContactModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsContactModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.contactModal}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.contactTitle}>Help & Support</Text>
                  <Text style={styles.contactSubtitle}>
                    We're here to help! Send us a message and we'll get back to you as soon as possible.
                  </Text>

                  <View style={styles.contactForm}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your full name"
                        placeholderTextColor="#8a9099"
                        value={contactForm.name}
                        onChangeText={(text) => setContactForm({...contactForm, name: text})}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        placeholderTextColor="#8a9099"
                        value={contactForm.email}
                        onChangeText={(text) => setContactForm({...contactForm, email: text})}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Subject</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="What's this about?"
                        placeholderTextColor="#8a9099"
                        value={contactForm.subject}
                        onChangeText={(text) => setContactForm({...contactForm, subject: text})}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Message</Text>
                      <TextInput
                        style={[styles.input, styles.messageInput]}
                        placeholder="Tell us how we can help you..."
                        placeholderTextColor="#8a9099"
                        value={contactForm.message}
                        onChangeText={(text) => setContactForm({...contactForm, message: text})}
                        multiline={true}
                        numberOfLines={6}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.contactSubmitButton}
                    onPress={handleContactSubmit}
                  >
                    <Text style={styles.contactSubmitText}>Send Message</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.contactCancelButton}
                    onPress={() => setIsContactModalVisible(false)}
                  >
                    <Text style={styles.contactCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <BottomNav />
    </View>
  );
}

const CARD = 'rgba(50, 50, 50, 0.7)';
const BORDER = 'rgba(255, 255, 255, 0.1)';
const TEXT = '#FFFFFF';
const MUTED = 'rgba(255, 255, 255, 0.7)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 162, 39, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: MUTED,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: MUTED,
  },
  settingSubtitleRestoring: {
    color: '#C9A227',
    fontStyle: 'italic',
  },
  settingArrow: {
    fontSize: 24,
    color: MUTED,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  aboutModal: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 24,
  },
  aboutSection: {
    marginBottom: 20,
  },
  aboutHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  aboutCloseButton: {
    backgroundColor: '#C9A227',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  aboutCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactModal: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 16,
    padding: 24,
    maxHeight: '85%',
    width: '100%',
    borderWidth: 1,
    borderColor: BORDER,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  contactForm: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: TEXT,
  },
  messageInput: {
    height: 120,
    paddingTop: 16,
  },
  contactActions: {
    gap: 12,
  },
  contactSubmitButton: {
    backgroundColor: '#C9A227',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactSubmitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactCancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  contactCancelText: {
    color: MUTED,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dangerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
    marginBottom: 2,
  },
});
