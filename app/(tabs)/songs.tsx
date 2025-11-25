import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getBibleSongs } from '../../lib/supabase';
import BottomNav from '../../components/BottomNav';
import { useAudio } from '../../context/AudioContext';

export default function Songs() {
  const router = useRouter();
  const {
    songs,
    setSongs,
    currentSongIndex,
    isPlaying,
    isRepeatOn,
    bar1Anim,
    bar2Anim,
    bar3Anim,
    playSong,
    togglePlayPause,
    playPreviousSong,
    playNextSong,
    toggleRepeat,
  } = useAudio();

  useEffect(() => {
    if (songs.length === 0) {
      loadSongs();
    }
  }, []);

  const loadSongs = async () => {
    const songList = await getBibleSongs();
    setSongs(songList);
  };

  const handleSongPress = (index: number) => {
    if (currentSongIndex === index) {
      togglePlayPause();
    } else {
      playSong(index);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worship Songs</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Song Controller */}
      {currentSongIndex !== null && (
        <View style={styles.controllerContainer}>
          {/* Current Song Name */}
          <Text style={styles.currentSongName} numberOfLines={1}>
            {songs[currentSongIndex]?.name || 'No Song Playing'}
          </Text>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Repeat Button */}
            <TouchableOpacity onPress={toggleRepeat} style={styles.controlButton}>
              <Ionicons
                name={isRepeatOn ? "repeat" : "repeat-outline"}
                size={24}
                color={isRepeatOn ? "#C9A227" : "rgba(255, 255, 255, 0.6)"}
              />
            </TouchableOpacity>

            {/* Previous Button */}
            <TouchableOpacity onPress={playPreviousSong} style={styles.controlButton}>
              <Ionicons name="play-back" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Play/Pause Button */}
            <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={36}
                color="#1A1A1A"
              />
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity onPress={playNextSong} style={styles.controlButton}>
              <Ionicons name="play-forward" size={32} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Placeholder for symmetry */}
            <View style={styles.controlButton} />
          </View>
        </View>
      )}

      {/* Songs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {songs.map((song, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.songCard,
              currentSongIndex === index && styles.songCardActive,
            ]}
            onPress={() => handleSongPress(index)}
            activeOpacity={0.7}
          >
            <View style={styles.songInfo}>
              <Text style={styles.songName}>{song.name}</Text>
            </View>

            {currentSongIndex === index && isPlaying ? (
              <View style={styles.audioBars}>
                <Animated.View
                  style={[
                    styles.audioBar,
                    { transform: [{ scaleY: bar1Anim }] }
                  ]}
                />
                <Animated.View
                  style={[
                    styles.audioBar,
                    { transform: [{ scaleY: bar2Anim }] }
                  ]}
                />
                <Animated.View
                  style={[
                    styles.audioBar,
                    { transform: [{ scaleY: bar3Anim }] }
                  ]}
                />
              </View>
            ) : (
              <Ionicons
                name={currentSongIndex === index ? "pause" : "play"}
                size={24}
                color={currentSongIndex === index ? "#C9A227" : "rgba(255, 255, 255, 0.6)"}
              />
            )}
          </TouchableOpacity>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  placeholder: {
    width: 40,
  },
  controllerContainer: {
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
  },
  currentSongName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    padding: 8,
    width: 48,
    alignItems: 'center',
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  songCard: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songCardActive: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.4)',
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
  },
  songName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  audioBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 20,
  },
  audioBar: {
    width: 3,
    height: 20,
    backgroundColor: '#C9A227',
    borderRadius: 2,
  },
  bottomSpacer: {
    height: 120,
  },
});
