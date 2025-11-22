import { createContext, useContext, useState, ReactNode } from 'react';
import { getBackgroundImages } from '../lib/supabase';

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
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [currentBgIndex, setCurrentBgIndex] = useState(() =>
    Math.floor(Math.random() * BACKGROUND_IMAGES.length)
  );

  const toggleNav = () => {
    setIsNavVisible(prev => !prev);
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
