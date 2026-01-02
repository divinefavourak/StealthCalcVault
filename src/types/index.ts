// src/types/index.ts

export type FileItem = {
  id: string;
  name: string;
  type: string;
  encPath: string;
  originalUri?: string;
};

export type NavigationProps = {
  navigation: any; // In a full app, replace with proper StackNavigationProp types
  route?: any;
};

// Add more shared types here in the future, e.g.:
// export interface VaultFile { ... }
// export type CalculatorButton = '0' | '1' | ... | '=' | 'AC';