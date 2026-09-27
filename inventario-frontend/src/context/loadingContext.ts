import { createContext } from 'react';

export interface LoadingContextType {
  isLoading: boolean;
  setLoading: (value: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);
