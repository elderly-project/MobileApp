import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ZoomContextType {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  getScaledSize: (baseSize: number) => number;
  getScaledPadding: (basePadding: number) => number;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

const ZOOM_STORAGE_KEY = '@health_app_zoom_level';
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.2;
const DEFAULT_ZOOM = 1.0;

interface ZoomProviderProps {
  children: ReactNode;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children }) => {
  const [zoomLevel, setZoomLevelState] = useState<number>(DEFAULT_ZOOM);

  // Load zoom level from storage on app start
  useEffect(() => {
    loadZoomLevel();
  }, []);

  const loadZoomLevel = async () => {
    try {
      const savedZoom = await AsyncStorage.getItem(ZOOM_STORAGE_KEY);
      if (savedZoom) {
        const parsedZoom = parseFloat(savedZoom);
        if (parsedZoom >= MIN_ZOOM && parsedZoom <= MAX_ZOOM) {
          setZoomLevelState(parsedZoom);
        }
      }
    } catch (error) {
      console.error('Error loading zoom level:', error);
    }
  };

  const setZoomLevel = async (level: number) => {
    const clampedLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level));
    setZoomLevelState(clampedLevel);
    
    try {
      await AsyncStorage.setItem(ZOOM_STORAGE_KEY, clampedLevel.toString());
    } catch (error) {
      console.error('Error saving zoom level:', error);
    }
  };

  const zoomIn = () => {
    const newLevel = Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP);
    setZoomLevel(newLevel);
  };

  const zoomOut = () => {
    const newLevel = Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);
    setZoomLevel(newLevel);
  };

  const resetZoom = () => {
    setZoomLevel(DEFAULT_ZOOM);
  };

  const getScaledSize = (baseSize: number): number => {
    return Math.round(baseSize * zoomLevel);
  };

  const getScaledPadding = (basePadding: number): number => {
    return Math.round(basePadding * zoomLevel);
  };

  const value: ZoomContextType = {
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    getScaledSize,
    getScaledPadding,
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
}; 