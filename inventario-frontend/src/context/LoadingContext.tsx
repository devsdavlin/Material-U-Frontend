import React, { useCallback, useMemo, useState } from 'react';
import { LoadingContext } from './loadingContext';

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = useCallback((value: boolean) => {
    setIsLoading(value);
  }, []);

  const value = useMemo(() => ({ isLoading, setLoading }), [isLoading, setLoading]);

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};
