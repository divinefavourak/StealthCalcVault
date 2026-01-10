import React, { createContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const Colors = {
  light: {
    background: '#F2F2F7',
    text: '#000000',
    displaySubtext: '#8E8E93',
    buttonBg: '#FFFFFF',
    buttonText: '#000000',
    operatorBg: '#E5E5EA', // Light gray for top row
    operatorText: '#000000',
    accentBg: '#4B5EFC', // Blue for equals
    accentText: '#FFFFFF',
    functionBg: '#F2F2F7',
    activeOp: '#FFFFFF',
  },
  dark: {
    background: '#000000',
    text: '#FFFFFF',
    displaySubtext: '#636366',
    buttonBg: '#2C2C2E', // Dark gray
    buttonText: '#FFFFFF',
    operatorBg: '#1C1C1E', // Darker gray
    operatorText: '#A1A1A6', // Function keys color
    accentBg: '#4B5EFC', // Blue for equals
    accentText: '#FFFFFF',
    functionBg: '#1C1C1E',
    activeOp: '#4A4A4C',
  },
};

interface AppContextType {
  isVaultUnlocked: boolean;
  unlockVault: () => void;
  lockVault: () => void;
  isAuthMode: boolean;
  setAuthMode: (mode: boolean) => void;
  wrongAttempts: number;
  setWrongAttempts: (n: number) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  colors: typeof Colors.light;
  history: string[];
  addToHistory: (entry: string) => void;
  clearHistory: () => void;
  calcMode: 'basic' | 'scientific' | 'converter';
  setCalcMode: (mode: 'basic' | 'scientific' | 'converter') => void;
}

export const AppContext = createContext<AppContextType>({
  isVaultUnlocked: false,
  unlockVault: () => { },
  lockVault: () => { },
  isAuthMode: false,
  setAuthMode: () => { },
  wrongAttempts: 0,
  setWrongAttempts: () => { },
  theme: 'light',
  toggleTheme: () => { },
  colors: Colors.light,
  history: [],
  addToHistory: () => { },
  clearHistory: () => { },
  calcMode: 'basic',
  setCalcMode: () => { },
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isAuthMode, setAuthMode] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [history, setHistory] = useState<string[]>([]);
  const [calcMode, setCalcMode] = useState<'basic' | 'scientific' | 'converter'>('basic');

  // Auto-lock Ref to prevent stale closures
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'inactive' || nextAppState === 'background')
      ) {
        // App went to background - Lock functionality
        lockVault();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const unlockVault = () => setIsVaultUnlocked(true);
  const lockVault = () => {
    setIsVaultUnlocked(false);
    setAuthMode(false);
    setWrongAttempts(0);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addToHistory = (entry: string) => {
    setHistory(prev => [entry, ...prev].slice(0, 50));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const colors = Colors[theme];

  return (
    <AppContext.Provider value={{
      isVaultUnlocked,
      unlockVault,
      lockVault,
      isAuthMode,
      setAuthMode,
      wrongAttempts,
      setWrongAttempts,
      theme,
      toggleTheme,
      colors,
      history,
      addToHistory,
      clearHistory,
      calcMode,
      setCalcMode
    }}>
      {children}
    </AppContext.Provider>
  );
};