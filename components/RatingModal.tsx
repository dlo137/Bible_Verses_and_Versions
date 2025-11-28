import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RatingModalProps {
  visible: boolean;
  onRate: () => void;
  onDismiss: () => void;
}

export default function RatingModal({ visible, onRate, onDismiss }: RatingModalProps) {
  const handleRate = () => {
    // Open app store rating page
    const storeUrl = Platform.OS === 'android'
      ? 'https://play.google.com/store/apps/details?id=com.yourbibleapp'
      : 'https://apps.apple.com/app/idYOURAPPID?action=write-review';

    Linking.openURL(storeUrl);
    onRate();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Star Icons */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name="star"
                size={32}
                color="#FFD700"
                style={styles.star}
              />
            ))}
          </View>

          {/* Title */}
          <Text style={styles.title}>Enjoying our App?</Text>

          {/* Message */}
          <Text style={styles.message}>
            Tap a star to rate it on the app store. It would really help us!
          </Text>

          {/* Rate Button */}
          <TouchableOpacity style={styles.rateButton} onPress={handleRate}>
            <Text style={styles.rateButtonText}>Rate Now</Text>
          </TouchableOpacity>

          {/* Dismiss Button */}
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 4,
  },
  star: {
    marginHorizontal: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  rateButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dismissButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#8A8A8A',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
