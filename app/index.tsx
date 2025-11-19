import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';

const SCREENS = ['welcome', 'prayer', 'why', 'confirmation', 'reminder', 'frequency', 'bad habits', 'therapy'];

const REASONS = [
  'Deepen my relationship with God',
  'Learn from Scripture',
  'Practice Prayer',
  'Build better habits',
  'Find community / connection',
  'Improve my rest and peace',
  'Find calm and reduce stress',
];

const BAD_HABITS = [
  'Addiction',
  'Doomscrolling social media',
  'Consuming negative news',
  'Excessive worrying',
  'Pornography',
  'Substance use',
  'Procrastination',
  'None apply to me',
];

const FREQUENCY_OPTIONS = [
  'Every week',
  'Once a month',
  'Only occasionally',
  'When I need support',
  'Not at all',
];

const THERAPY_OPTIONS = [
  'Once a week',
  'A few times a month',
  'Sometimes',
  'Only when needed',
  "I don't currently",
];

const REASON_CONFIRMATIONS: { [key: string]: string } = {
  'Deepen my relationship with God': 'Discover daily Scripture and prayers designed to draw you closer to God\'s heart.',
  'Learn from Scripture': 'Explore guided Bible readings that make God\'s Word accessible and meaningful.',
  'Practice Prayer': 'Build a consistent prayer practice with daily prompts and reflections.',
  'Build better habits': 'Replace old patterns with faith-centered routines that transform your life.',
  'Find community / connection': 'Connect with others on the same journey through shared reflections and encouragement.',
  'Improve my rest and peace': 'Find rest in Scripture and prayer that calms your mind and restores your soul.',
  'Find calm and reduce stress': 'Experience God\'s peace through daily practices that ease anxiety and worry.',
};

const BAD_HABIT_CONFIRMATIONS: { [key: string]: string } = {
  'Addiction': 'Find freedom from addictive patterns through Scripture and daily reflection.',
  'Doomscrolling social media': 'Replace mindless scrolling with intentional time in God\'s Word.',
  'Consuming negative news': 'Trade anxiety-inducing news for peace-giving Scripture.',
  'Excessive worrying': 'Exchange worry for prayer and find God\'s peace that surpasses understanding.',
  'Pornography': 'Build purity and renew your mind through daily Scripture and accountability.',
  'Substance use': 'Discover strength and healing through faith-centered daily practices.',
  'Procrastination': 'Develop discipline and purpose through structured spiritual growth.',
  'None apply to me': 'Grow closer to God through daily Scripture and prayer.',
};

export default function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedBadHabits, setSelectedBadHabits] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [selectedTherapy, setSelectedTherapy] = useState<string>('');
  const router = useRouter();

  // Animation values
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animations when screen changes
    fadeAnim1.setValue(0);
    fadeAnim2.setValue(0);
    fadeAnim3.setValue(0);

    // Start sequential fade-in animations
    Animated.sequence([
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentScreen]);

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const toggleBadHabit = (habit: string) => {
    if (selectedBadHabits.includes(habit)) {
      setSelectedBadHabits(selectedBadHabits.filter((h) => h !== habit));
    } else {
      setSelectedBadHabits([...selectedBadHabits, habit]);
    }
  };

  const selectFrequency = (frequency: string) => {
    setSelectedFrequency(frequency);
  };

  const selectTherapy = (therapy: string) => {
    setSelectedTherapy(therapy);
  };

  const handleContinue = () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Onboarding complete - navigate to plans
      router.push('/plans');
    }
  };

  const renderContent = () => {
    if (currentScreen === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <Animated.Text style={[styles.welcomeTitle, { opacity: fadeAnim1 }]}>
            Welcome to{'\n'}Exploring Faith Together.
          </Animated.Text>
          <Animated.Text style={[styles.welcomeSubtitle, { opacity: fadeAnim2 }]}>
            First, let's take a moment for a prayer.
          </Animated.Text>
        </View>
      );
    }
    if (currentScreen === 1) {
      return (
        <View style={styles.welcomeContainer}>
          <Animated.Text style={[styles.welcomeTitle, { opacity: fadeAnim1 }]}>
            Dear God,
          </Animated.Text>
          <Animated.Text style={[styles.welcomeSubtitle, { opacity: fadeAnim2 }]}>
            Thank you for meeting me right where I am. Teach me, guide me, and help me understand your word. Help me learn with an open heart and patience.
          </Animated.Text>
        </View>
      );
    }
    if (currentScreen === 2) {
      return (
        <ScrollView
          style={styles.choiceScreenContainer}
          contentContainerStyle={styles.choiceScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.choiceHeading}>What brings you on this faith journey?</Text>
          <View style={styles.choiceList}>
            {REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.choiceItem,
                  selectedReasons.includes(reason) && styles.choiceItemSelected,
                ]}
                onPress={() => toggleReason(reason)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selectedReasons.includes(reason) && styles.choiceTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }
    if (currentScreen === 3) {
      return (
        <ScrollView
          style={styles.choiceScreenContainer}
          contentContainerStyle={styles.choiceScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.choiceHeading}>Your Faith Journey</Text>
          {selectedReasons.length > 0 ? (
            <View style={styles.confirmationList}>
              {selectedReasons.map((reason) => (
                <View key={reason} style={styles.confirmationItem}>
                  <Text style={styles.confirmationHabit}>{reason}</Text>
                  <Text style={styles.confirmationMessage}>
                    {REASON_CONFIRMATIONS[reason]}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.confirmationItem}>
              <Text style={styles.confirmationMessage}>
                Begin your journey of spiritual growth through daily Scripture and prayer.
              </Text>
            </View>
          )}
        </ScrollView>
      );
    }
    if (currentScreen === 5) {
      return (
        <ScrollView
          style={styles.choiceScreenContainer}
          contentContainerStyle={styles.choiceScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.choiceHeading}>How often do you seek guidance from clergy or a mental health professional?</Text>
          <View style={styles.choiceList}>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.choiceItem,
                  selectedFrequency === option && styles.choiceItemSelected,
                ]}
                onPress={() => selectFrequency(option)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selectedFrequency === option && styles.choiceTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }
    if (currentScreen === 6) {
      return (
        <ScrollView
          style={styles.choiceScreenContainer}
          contentContainerStyle={styles.choiceScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.choiceHeading}>Which bad habits would you like to replace?</Text>
          <View style={styles.choiceList}>
            {BAD_HABITS.map((habit) => (
              <TouchableOpacity
                key={habit}
                style={[
                  styles.choiceItem,
                  selectedBadHabits.includes(habit) && styles.choiceItemSelected,
                ]}
                onPress={() => toggleBadHabit(habit)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selectedBadHabits.includes(habit) && styles.choiceTextSelected,
                  ]}
                >
                  {habit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }
    if (currentScreen === 7) {
      return (
        <ScrollView
          style={styles.choiceScreenContainer}
          contentContainerStyle={styles.choiceScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.choiceHeading}>How often do you seek guidance from clergy or a mental health professional?</Text>
          <View style={styles.choiceList}>
            {THERAPY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.choiceItem,
                  selectedTherapy === option && styles.choiceItemSelected,
                ]}
                onPress={() => selectTherapy(option)}
              >
                <Text
                  style={[
                    styles.choiceText,
                    selectedTherapy === option && styles.choiceTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      );
    }
    return <Text style={styles.screenName}>{SCREENS[currentScreen]}</Text>;
  };

  return (
    <ImageBackground
      source={require('../assets/images/onboarding/onboarding-bg2.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.content}>
        {renderContent()}

        {currentScreen <= 1 ? (
          <Animated.View style={{ opacity: fadeAnim3, width: '100%', alignItems: 'center', paddingHorizontal: 24 }}>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>
                {currentScreen === 1 ? 'AMEN' : "LET'S PRAY"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 24 }}>
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>
                CONTINUE
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingBottom: 60,
  },
  // Welcome screen styles
  welcomeContainer: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '300',
    color: '#1A1A1A',
    textAlign: 'left',
    letterSpacing: 0.5,
    lineHeight: 38,
    marginTop: 180,
    marginLeft: 25,
    marginRight: 25,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#6B6B6B',
    textAlign: 'left',
    letterSpacing: 0.5,
    lineHeight: 28,
    marginTop: 12,
    marginLeft: 25,
    marginRight: 25,
  },
  // Choice screen styles
  choiceScreenContainer: {
    width: '100%',
  },
  choiceScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  choiceHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'left',
    marginBottom: 24,
    marginTop: 40,
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  choiceList: {
    width: '100%',
  },
  choiceItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  choiceItemSelected: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  choiceText: {
    fontSize: 17,
    textAlign: 'left',
    color: '#5A5A5A',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
  choiceTextSelected: {
    color: '#4A90E2',
    fontWeight: '500',
  },
  // Confirmation screen styles
  confirmationList: {
    width: '100%',
  },
  confirmationItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmationHabit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  confirmationMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5A5A5A',
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  // Legacy styles for other screens
  screenName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textTransform: 'capitalize',
    color: '#2C2C2C',
    marginLeft: 15,
  },
  button: {
    backgroundColor: 'transparent',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    minWidth: '85%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 4,
  },
});
