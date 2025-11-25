import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Animated, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAudioPlayer } from 'expo-audio';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREENS = ['welcome', 'prayer', 'why', 'confirmation', 'reminder', 'bad habits', 'therapy', 'free trial offer', 'trial ending reminder'];

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
  const [reminderTime, setReminderTime] = useState(new Date());
  const router = useRouter();

  // Cathedral music state
  const [cathedralSongs, setCathedralSongs] = useState<{ name: string; url: string }[]>([]);
  const [currentCathedralIndex, setCurrentCathedralIndex] = useState(0);
  const [cathedralUrl, setCathedralUrl] = useState('');
  const cathedralPlayer = useAudioPlayer(cathedralUrl);

  // Animation values
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const hasAnimatedScreen = useRef<Set<number>>(new Set());

  // Confirmation items animation values (max 7 items based on REASONS length)
  const confirmationAnims = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;

  // Prayer screen animation values (3 lines)
  const prayerAnim1 = useRef(new Animated.Value(0)).current;
  const prayerAnim2 = useRef(new Animated.Value(0)).current;
  const prayerAnim3 = useRef(new Animated.Value(0)).current;

  // Screens that should not have fade-in animations
  const noAnimationScreens = [2, 5, 6];

  // Track if prayer animation has run
  const hasPrayerAnimated = useRef(false);

  // Load cathedral songs on mount
  useEffect(() => {
    loadCathedralSongs();
  }, []);

  const loadCathedralSongs = async () => {
    try {
      const { data, error } = await supabase.storage.from('bible_songs').list('', {
        limit: 100,
        offset: 0,
      });

      if (error) {
        console.error('Error fetching cathedral songs:', error);
        return;
      }

      // Filter for cathedral songs and sort them numerically
      const songs = data
        .filter(file => file.name.toLowerCase().startsWith('cathedral') &&
                        (file.name.endsWith('.mp3') || file.name.endsWith('.m4a') || file.name.endsWith('.wav')))
        .sort((a, b) => {
          const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
          const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
          return numA - numB;
        })
        .map(file => ({
          name: file.name.replace(/\.(mp3|m4a|wav)$/, ''),
          url: `${supabase.storage.from('bible_songs').getPublicUrl(file.name).data.publicUrl}`,
        }));

      console.log('Loaded cathedral songs:', songs);
      setCathedralSongs(songs);

      // Auto-play cathedral 1.mp3 (first song)
      if (songs.length > 0) {
        setCathedralUrl(songs[0].url);
        setCurrentCathedralIndex(0);
      }
    } catch (error) {
      console.error('Error loading cathedral songs:', error);
    }
  };

  // Auto-play when cathedral URL is set
  useEffect(() => {
    if (cathedralUrl && cathedralPlayer) {
      setTimeout(() => {
        cathedralPlayer.play();
      }, 100);
    }
  }, [cathedralUrl, cathedralPlayer]);

  // Listen for song end and play next song
  useEffect(() => {
    if (!cathedralPlayer) return;

    const checkPlaybackStatus = setInterval(() => {
      if (cathedralPlayer.playing === false && cathedralPlayer.duration > 0 &&
          Math.abs(cathedralPlayer.currentTime - cathedralPlayer.duration) < 1) {
        // Song has ended, play next song
        playNextCathedralSong();
      }
    }, 1000);

    return () => clearInterval(checkPlaybackStatus);
  }, [cathedralPlayer, currentCathedralIndex, cathedralSongs]);

  const playNextCathedralSong = () => {
    if (cathedralSongs.length === 0) return;

    const nextIndex = currentCathedralIndex < cathedralSongs.length - 1
      ? currentCathedralIndex + 1
      : 0; // Loop back to first song

    setCurrentCathedralIndex(nextIndex);
    setCathedralUrl(cathedralSongs[nextIndex].url);
  };

  // Animate prayer screen lines sequentially when on screen 1
  useEffect(() => {
    if (currentScreen === 1 && !hasPrayerAnimated.current) {
      hasPrayerAnimated.current = true;

      // Reset prayer animations
      prayerAnim1.setValue(0);
      prayerAnim2.setValue(0);
      prayerAnim3.setValue(0);

      // Start staggered animations for prayer lines after title fades in
      setTimeout(() => {
        Animated.stagger(2000, [
          Animated.timing(prayerAnim1, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(prayerAnim2, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(prayerAnim3, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
        ]).start();
      }, 2800); // Wait for title to fade in first
    }
  }, [currentScreen, prayerAnim1, prayerAnim2, prayerAnim3]);

  // Animate confirmation items sequentially when on screen 3
  useEffect(() => {
    if (currentScreen === 3 && !hasAnimatedScreen.current.has(3)) {
      // Reset all confirmation animations
      confirmationAnims.forEach(anim => anim.setValue(0));

      // Start staggered animations for confirmation items after heading fades in
      const itemCount = selectedReasons.length > 0 ? selectedReasons.length : 1;
      const itemAnimations = confirmationAnims.slice(0, itemCount).map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );

      // Delay confirmation items until after heading (fadeAnim1) finishes
      setTimeout(() => {
        Animated.stagger(1200, itemAnimations).start();
      }, 2000); // Wait for heading to fade in first
    }
  }, [currentScreen, selectedReasons.length, confirmationAnims]);

  // Run animation only once per screen
  useEffect(() => {
    // Skip animations for certain screens - show content immediately
    if (noAnimationScreens.includes(currentScreen)) {
      fadeAnim1.setValue(1);
      fadeAnim2.setValue(1);
      fadeAnim3.setValue(1);
      return;
    }

    // If we've already animated this screen, don't animate again
    if (hasAnimatedScreen.current.has(currentScreen)) {
      return;
    }

    // Mark this screen as animated
    hasAnimatedScreen.current.add(currentScreen);

    // Stop any running animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Reset animation values
    fadeAnim1.setValue(0);
    fadeAnim2.setValue(0);
    fadeAnim3.setValue(0);

    // Start sequential fade-in animations with stagger
    animationRef.current = Animated.stagger(2000, [
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]);

    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [currentScreen, fadeAnim1, fadeAnim2, fadeAnim3]);

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

  const handleContinue = async () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Onboarding complete - save cathedral music state before navigating
      if (cathedralSongs.length > 0) {
        // Stop the player before navigating
        if (cathedralPlayer) {
          try {
            cathedralPlayer.pause();
          } catch (error) {
            console.log('Error pausing cathedral player:', error);
          }
        }

        await AsyncStorage.setItem('cathedralMusic', JSON.stringify({
          songs: cathedralSongs,
          currentIndex: currentCathedralIndex,
        }));
      }

      // Navigate to plans (paywall) screen
      router.push('/plans');
    }
  };

  const renderContent = () => {
    if (currentScreen === 0) {
      return (
        <View style={styles.welcomeContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={async () => {
              // Save cathedral music state before skipping
              if (cathedralSongs.length > 0) {
                // Stop the player before navigating
                if (cathedralPlayer) {
                  try {
                    cathedralPlayer.pause();
                  } catch (error) {
                    console.log('Error pausing cathedral player:', error);
                  }
                }

                await AsyncStorage.setItem('cathedralMusic', JSON.stringify({
                  songs: cathedralSongs,
                  currentIndex: currentCathedralIndex,
                }));
              }
              router.push('/plans');
            }}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <Animated.Text style={[styles.welcomeTitle, { opacity: fadeAnim1 }]}>
            Welcome to{'\n'}Exploring Faith Together
          </Animated.Text>
          <Animated.Text style={[styles.welcomeSubtitle, { opacity: fadeAnim2 }]}>
            First, let's take a moment for prayer
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
          <View style={styles.prayerContainer}>
            <Text style={styles.prayerText}>
              <Animated.Text style={{ opacity: prayerAnim1 }}>
                Thank you for meeting me right where I am.{' '}
              </Animated.Text>
              <Animated.Text style={{ opacity: prayerAnim2 }}>
                Teach me, guide me, and help me understand your word.{' '}
              </Animated.Text>
              <Animated.Text style={{ opacity: prayerAnim3 }}>
                Help me learn with an open heart and patience.
              </Animated.Text>
            </Text>
          </View>
        </View>
      );
    }
    if (currentScreen === 2) {
      return (
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView
            style={styles.choiceScreenContainer}
            contentContainerStyle={styles.choiceScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.Text style={[styles.choiceHeading, { opacity: fadeAnim1 }]}>What brings you on this faith journey?</Animated.Text>
            <Animated.View style={[styles.choiceList, { opacity: fadeAnim2 }]}>
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
            </Animated.View>
          </ScrollView>
        </View>
      );
    }
    if (currentScreen === 3) {
      return (
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView
            style={styles.choiceScreenContainer}
            contentContainerStyle={styles.choiceScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.Text style={[styles.choiceHeading, { opacity: fadeAnim1 }]}>We'll help you...</Animated.Text>
            {selectedReasons.length > 0 ? (
              <View style={styles.confirmationList}>
                {selectedReasons.map((reason, index) => (
                  <Animated.View key={reason} style={[styles.confirmationItem, { opacity: confirmationAnims[index] }]}>
                    <View style={styles.confirmationRow}>
                      <Text style={styles.checkmark}>✓</Text>
                      <Text style={styles.confirmationMessage}>
                        {REASON_CONFIRMATIONS[reason]}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <Animated.View style={[styles.confirmationItem, { opacity: confirmationAnims[0] }]}>
                <View style={styles.confirmationRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.confirmationMessage}>
                    Begin your journey of spiritual growth through daily Scripture and prayer.
                  </Text>
                </View>
              </Animated.View>
            )}
          </ScrollView>
        </View>
      );
    }
    if (currentScreen === 4) {
      return (
        <Animated.View style={[styles.reminderContainer, { opacity: fadeAnim1 }]}>
          <Text style={styles.reminderHeading}>When do you find yourself needing a boost of strength?</Text>

          <View style={styles.timePickerWrapper}>
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setReminderTime(selectedDate);
                }
              }}
              textColor="#000000"
              style={styles.timePicker}
            />
          </View>
        </Animated.View>
      );
    }
    if (currentScreen === 5) {
      return (
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView
            style={styles.choiceScreenContainer}
            contentContainerStyle={styles.choiceScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.choiceHeading}>Which bad habits would you like to get rid of?</Text>
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
        </View>
      );
    }
    if (currentScreen === 6) {
      return (
        <View style={{ flex: 1, width: '100%' }}>
          <ScrollView
            style={styles.choiceScreenContainer}
            contentContainerStyle={styles.choiceScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.choiceHeading}>How often do you talk with someone about your faith and well being?</Text>
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
        </View>
      );
    }
    if (currentScreen === 7) {
      return (
        <Animated.View style={[styles.trialContainer, { opacity: fadeAnim1 }]}>
          <View style={styles.trialTitleContainer}>
            <Text style={styles.trialTitle}>We want you to try our</Text>
            <Text style={styles.trialTitleHighlight}>Holy Bible App</Text>
            <Text style={styles.trialTitle}>for free</Text>
          </View>
        </Animated.View>
      );
    }
    if (currentScreen === 8) {
      return (
        <Animated.View style={[styles.reminderContainer, { opacity: fadeAnim1 }]}>
          <View style={styles.dueDateReminderTextContainer}>
            <Text style={styles.dueDateReminderText}>You'll get a reminder</Text>
            <Text style={styles.dueDateReminderHighlight}>2 days</Text>
            <Text style={styles.dueDateReminderText}>before your trial ends.</Text>
          </View>
          <Text style={styles.bellIcon}>🔔</Text>
        </Animated.View>
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

        <Animated.View style={{ opacity: fadeAnim3, width: '100%', alignItems: 'center', paddingHorizontal: 24 }}>
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>
              {currentScreen === 0 ? "LET'S PRAY" : currentScreen === 1 ? 'AMEN' : currentScreen === 4 ? 'SCHEDULE A NOTIFICATION' : currentScreen === 8 ? 'TRY FOR $0.00' : 'CONTINUE'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
  skipButton: {
    position: 'absolute',
    top: 0,
    left: 25,
    padding: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#5A5A5A',
    fontWeight: '400',
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
  prayerContainer: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 12,
  },
  prayerText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#6B6B6B',
    textAlign: 'left',
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  // Choice screen styles
  choiceScreenContainer: {
    width: '100%',
  },
  choiceScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  choiceHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 40,
    letterSpacing: 0.3,
    lineHeight: 28,
    width: '100%',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceItemSelected: {
    backgroundColor: '#E8F4FD',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  choiceText: {
    fontSize: 17,
    textAlign: 'center',
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
    backgroundColor: 'transparent',
    padding: 0,
    marginBottom: 16,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginRight: 12,
    marginTop: 2,
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
    color: '#000000',
    lineHeight: 24,
    letterSpacing: 0.2,
    flex: 1,
  },
  // Reminder screen styles
  reminderContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 40,
    flex: 1,
  },
  reminderHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  timePickerWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePicker: {
    width: '100%',
    height: 200,
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
  // Free trial offer screen styles
  trialContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 160,
    flex: 1,
  },
  trialTitleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  trialTitle: {
    fontSize: 28,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  trialTitleHighlight: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  trialSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  trialFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  trialFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  trialFeatureText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1A1A1A',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  trialNote: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  // Trial ending reminder screen styles
  reminderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'left',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  reminderSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'left',
    marginBottom: 32,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  dueDateReminderTextContainer: {
    marginTop: 80,
    marginBottom: 32,
    alignItems: 'center',
  },
  dueDateReminderText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#5A5A5A',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  dueDateReminderHighlight: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  bellIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginTop: 0,
  },
  reminderOptions: {
    width: '100%',
  },
  reminderOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  reminderOptionText: {
    fontSize: 17,
    textAlign: 'left',
    color: '#5A5A5A',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});
