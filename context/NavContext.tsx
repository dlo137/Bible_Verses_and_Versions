import { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { Animated, Image } from 'react-native';
import { getBackgroundImages, BibleVerse } from '../lib/supabase';

// Number of background images in Supabase bucket (named 1.jpg, 2.jpg, etc.)
const BACKGROUND_IMAGE_COUNT = 10;
const BACKGROUND_IMAGES = getBackgroundImages(BACKGROUND_IMAGE_COUNT);

interface NavContextType {
  isNavVisible: boolean;
  setIsNavVisible: (visible: boolean) => void;
  toggleNav: () => void;
  currentBgImage: string;
  setCurrentBgIndex: (index: number) => void;
  backgroundImages: string[];
  isButtonVisible: boolean;
  setIsButtonVisible: (visible: boolean) => void;
  bgFadeAnim: Animated.Value;
  animateBgChange: (newIndex: number) => Promise<void>;
  currentVerse: BibleVerse | null;
  setCurrentVerse: (verse: BibleVerse | null) => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(() =>
    Math.floor(Math.random() * BACKGROUND_IMAGES.length)
  );
  const [currentVerse, setCurrentVerse] = useState<BibleVerse | null>(null);
  const bgFadeAnim = useRef(new Animated.Value(1)).current;

  const toggleNav = () => {
    setIsNavVisible(prev => !prev);
  };

  const animateBgChange = (newIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      const newImageUrl = BACKGROUND_IMAGES[newIndex];

      // Prefetch the new image first
      Image.prefetch(newImageUrl).then(() => {
        // Fade out current background
        Animated.timing(bgFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          // Change the background (image is already cached)
          setCurrentBgIndex(newIndex);
          // Fade in new background
          Animated.timing(bgFadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start(() => resolve());
        });
      }).catch(() => {
        // If prefetch fails, still do the transition
        Animated.timing(bgFadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setCurrentBgIndex(newIndex);
          Animated.timing(bgFadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start(() => resolve());
        });
      });
    });
  };

  const currentBgImage = BACKGROUND_IMAGES[currentBgIndex] || BACKGROUND_IMAGES[0];

  return (
    <NavContext.Provider value={{
      isNavVisible,
      setIsNavVisible,
      toggleNav,
      currentBgImage,
      setCurrentBgIndex,
      backgroundImages: BACKGROUND_IMAGES,
      isButtonVisible,
      setIsButtonVisible,
      bgFadeAnim,
      animateBgChange,
      currentVerse,
      setCurrentVerse,
    }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const context = useContext(NavContext);
  if (context === undefined) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
}
