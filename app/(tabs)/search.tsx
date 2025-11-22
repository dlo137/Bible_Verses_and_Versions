import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import BottomNav from '../../components/BottomNav';
import { useNav } from '../../context/NavContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Search() {
  const { currentBgImage } = useNav();

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: currentBgImage }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.text}>Search</Text>
      </View>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  text: {
    fontSize: 24,
    fontWeight: '300',
    color: '#1A1A1A',
  },
});
