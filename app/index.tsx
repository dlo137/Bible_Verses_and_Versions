import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const SCREENS = ['welcome', 'prayer', 'why', 'confirmation', 'reminder', 'frequency', 'bad habits', 'therapy'];

const REASONS = [
  'Grow closer to God',
  'Understand the Bible',
  'Learn to pray',
  'Improve habits',
  "I'm lonely",
  'Better sleep',
  'Reduce anxiety',
];

export default function Onboarding() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const router = useRouter();

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
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
        <>
          <Text style={styles.heading}>
            Welcome{'\n'}Let's Explore Faith Together
          </Text>
          <Text style={styles.bodyText}>
            You don't need to have all the answers.{'\n'}
            You don't need to be perfect.{'\n'}
            You're simply here... and that's enough.{'\n\n'}
            Let's take a gentle first step.
          </Text>
        </>
      );
    }
    if (currentScreen === 1) {
      return (
        <>
          <Text style={styles.heading}>God,{'\n'}</Text>
          <Text style={styles.bodyText}>
            Thank you for meeting me right where I am.{'\n'}
            Teach me, guide me and help me understand your word.{'\n'}
            Open my heart as I learn at my own pace.
          </Text>
        </>
      );
    }
    if (currentScreen === 2) {
      return (
        <>
          <Text style={styles.heading}>What brings you on this faith journey?</Text>
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
        </>
      );
    }
    return <Text style={styles.screenName}>{SCREENS[currentScreen]}</Text>;
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          {currentScreen === 1 ? 'Amen' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  screenName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textTransform: 'capitalize',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  choiceList: {
    width: '100%',
    marginBottom: 40,
  },
  choiceItem: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceItemSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  choiceText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  choiceTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
