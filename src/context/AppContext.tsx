import React, { createContext, useState } from 'react';

interface AppContextType {
  isVaultUnlocked: boolean;
  unlockVault: () => void;
  lockVault: () => void;
  isAuthMode: boolean;
  setAuthMode: (mode: boolean) => void;
  wrongAttempts: number;
  setWrongAttempts: (n: number) => void;
}

export const AppContext = createContext<AppContextType>({
  isVaultUnlocked: false,
  unlockVault: () => {},
  lockVault: () => {},
  isAuthMode: false,
  setAuthMode: () => {},
  wrongAttempts: 0,
  setWrongAttempts: () => {},
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isAuthMode, setAuthMode] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const unlockVault = () => setIsVaultUnlocked(true);
  const lockVault = () => {
    setIsVaultUnlocked(false);
    setAuthMode(false);
    setWrongAttempts(0);
  };

  return (
    <AppContext.Provider value={{ isVaultUnlocked, unlockVault, lockVault, isAuthMode, setAuthMode, wrongAttempts, setWrongAttempts }}>
      {children}
    </AppContext.Provider>
  );
};