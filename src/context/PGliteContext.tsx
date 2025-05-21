import React, { createContext, useContext, useEffect, useState } from "react";
import { initDatabase } from "../lib/db";

type PGliteContextType = {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
};
const PGliteContext = createContext<PGliteContextType>({
  isLoading: true,
  isInitialized: false,
  error: null,
});
export const usePGliteContext = () => useContext(PGliteContext);
export const PGliteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(
          "Failed to initialize database. Please refresh the page and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);
  return (
    <PGliteContext.Provider value={{ isLoading, isInitialized, error }}>
      {children}
    </PGliteContext.Provider>
  );
};
