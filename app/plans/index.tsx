import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const SCREENS = ['free trial', 'pay date reminder', 'IAP page'];

export default function Plans() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const router = useRouter();

  const handleContinue = () => {
    if (currentScreen < SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      // Navigate to main app after plans
      router.push('/(tabs)/verses');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenName}>{SCREENS[currentScreen]}</Text>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
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
});
