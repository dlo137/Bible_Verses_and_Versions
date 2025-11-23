import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Platform, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';

export default function ProfileScreen() {
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

  const settings = [
    { id: 'about', title: 'About', subtitle: 'App information' },
    { id: 'help', title: 'Help & Support', subtitle: 'Get assistance' },
    ...(Platform.OS === 'ios' ? [{
      id: 'rate',
      title: 'Rate the App',
      subtitle: 'Share your feedback on the App Store'
    }] : []),
  ];

  const handleRateApp = () => {
    Linking.openURL(storeUrl);
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
      case 'rate':
        handleRateApp();
        break;
      case 'help':
        setIsContactModalVisible(true);
        break;
      case 'about':
        setIsAboutModalVisible(true);
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>B</Text>
          </View>
          <Text style={styles.appName}>Bible App</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          {settings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              style={styles.settingItem}
              onPress={() => handleSettingPress(setting.id)}
            >
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
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
});
