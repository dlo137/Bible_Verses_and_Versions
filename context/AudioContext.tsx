import { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

interface AudioContextType {
  songs: { name: string; url: string }[];
  setSongs: (songs: { name: string; url: string }[]) => void;
  currentSongIndex: number | null;
  setCurrentSongIndex: (index: number | null) => void;
  currentSongUrl: string;
  setCurrentSongUrl: (url: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isRepeatOn: boolean;
  setIsRepeatOn: (repeat: boolean) => void;
  isCathedralMode: boolean;
  setIsCathedralMode: (mode: boolean) => void;
  player: ReturnType<typeof useAudioPlayer>;
  bar1Anim: Animated.Value;
  bar2Anim: Animated.Value;
  bar3Anim: Animated.Value;
  anim1Ref: React.MutableRefObject<Animated.CompositeAnimation | null>;
  anim2Ref: React.MutableRefObject<Animated.CompositeAnimation | null>;
  anim3Ref: React.MutableRefObject<Animated.CompositeAnimation | null>;
  startBarAnimations: () => void;
  stopBarAnimations: () => void;
  playSong: (index: number) => void;
  togglePlayPause: () => void;
  playPreviousSong: () => void;
  playNextSong: () => void;
  toggleRepeat: () => void;
  initializeCathedralMusic: (cathedralSongs: { name: string; url: string }[], currentIndex: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [songs, setSongs] = useState<{ name: string; url: string }[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [currentSongUrl, setCurrentSongUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [isCathedralMode, setIsCathedralMode] = useState(false); // Track if playing cathedral music

  const player = useAudioPlayer(currentSongUrl);

  const bar1Anim = useRef(new Animated.Value(0.3)).current;
  const bar2Anim = useRef(new Animated.Value(0.6)).current;
  const bar3Anim = useRef(new Animated.Value(0.9)).current;
  const anim1Ref = useRef<Animated.CompositeAnimation | null>(null);
  const anim2Ref = useRef<Animated.CompositeAnimation | null>(null);
  const anim3Ref = useRef<Animated.CompositeAnimation | null>(null);

  // Set loop based on repeat state
  useEffect(() => {
    if (player) {
      player.loop = isRepeatOn;
    }
  }, [player, isRepeatOn]);

  // Auto-play when player is ready and we want to play
  useEffect(() => {
    console.log('AudioContext: Auto-play effect triggered', {
      hasPlayer: !!player,
      isPlaying,
      currentSongUrl,
      currentSongIndex
    });

    if (player && isPlaying && currentSongUrl && currentSongIndex !== null) {
      console.log('AudioContext: Attempting to play song:', currentSongUrl);
      const timer = setTimeout(() => {
        try {
          player.play();
          console.log('AudioContext: Successfully called player.play()');
          startBarAnimations();
        } catch (error) {
          console.error('AudioContext: Error auto-playing song:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      console.log('AudioContext: Not playing because conditions not met');
    }
  }, [player, currentSongUrl]);

  // Listen for song end and auto-play next song if not on repeat
  useEffect(() => {
    if (!player) return;

    const handlePlaybackStatus = () => {
      // When song ends and repeat is off, play next song
      if (player.playing === false && player.duration > 0 && player.currentTime >= player.duration - 0.5) {
        if (!isRepeatOn && songs.length > 0 && currentSongIndex !== null) {
          console.log('AudioContext: Song ended, playing next song');
          playNextSong();
        }
      }
    };

    // Check playback status periodically
    const interval = setInterval(handlePlaybackStatus, 1000);

    return () => clearInterval(interval);
  }, [player, isRepeatOn, songs.length, currentSongIndex]);

  const startBarAnimations = () => {
    anim1Ref.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bar1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(bar1Anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );

    anim2Ref.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bar2Anim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(bar2Anim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );

    anim3Ref.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bar3Anim, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(bar3Anim, { toValue: 0.5, duration: 550, useNativeDriver: true }),
      ])
    );

    anim1Ref.current.start();
    anim2Ref.current.start();
    anim3Ref.current.start();
  };

  const stopBarAnimations = () => {
    if (anim1Ref.current) anim1Ref.current.stop();
    if (anim2Ref.current) anim2Ref.current.stop();
    if (anim3Ref.current) anim3Ref.current.stop();
    bar1Anim.setValue(0.3);
    bar2Anim.setValue(0.6);
    bar3Anim.setValue(0.9);
  };

  const playSong = (index: number) => {
    console.log('AudioContext: playSong called', { index, songsLength: songs.length });
    if (songs.length === 0) {
      console.log('AudioContext: No songs available, returning');
      return;
    }

    console.log('AudioContext: Playing song:', songs[index]);
    stopBarAnimations();
    setCurrentSongIndex(index);
    setCurrentSongUrl(songs[index].url);
    setIsPlaying(true);
    console.log('AudioContext: Set state - url:', songs[index].url, 'isPlaying: true');
    // The useEffect will handle playing when the player is ready
  };

  const togglePlayPause = () => {
    if (currentSongIndex === null) return;

    if (isPlaying) {
      player.pause();
      stopBarAnimations();
      setIsPlaying(false);
    } else {
      player.play();
      startBarAnimations();
      setIsPlaying(true);
    }
  };

  const playPreviousSong = () => {
    if (songs.length === 0 || currentSongIndex === null) return;

    const prevIndex = currentSongIndex > 0 ? currentSongIndex - 1 : songs.length - 1;
    playSong(prevIndex);
  };

  const playNextSong = () => {
    if (songs.length === 0 || currentSongIndex === null) return;

    const nextIndex = currentSongIndex < songs.length - 1 ? currentSongIndex + 1 : 0;
    playSong(nextIndex);
  };

  const toggleRepeat = () => {
    setIsRepeatOn(prev => !prev);
  };

  const initializeCathedralMusic = (cathedralSongs: { name: string; url: string }[], currentIndex: number) => {
    // Load cathedral songs into the main audio context
    setSongs(cathedralSongs);
    setCurrentSongIndex(currentIndex);
    setCurrentSongUrl(cathedralSongs[currentIndex].url);
    setIsCathedralMode(true);
    setIsPlaying(true);
    // The useEffect will handle playing when the player is ready
  };

  return (
    <AudioContext.Provider
      value={{
        songs,
        setSongs,
        currentSongIndex,
        setCurrentSongIndex,
        currentSongUrl,
        setCurrentSongUrl,
        isPlaying,
        setIsPlaying,
        isRepeatOn,
        setIsRepeatOn,
        isCathedralMode,
        setIsCathedralMode,
        player,
        bar1Anim,
        bar2Anim,
        bar3Anim,
        anim1Ref,
        anim2Ref,
        anim3Ref,
        startBarAnimations,
        stopBarAnimations,
        playSong,
        togglePlayPause,
        playPreviousSong,
        playNextSong,
        toggleRepeat,
        initializeCathedralMusic,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
