import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Centralized color scheme override state. When alwaysDark is true,
// the app should render in dark mode regardless of the OS setting.

type ColorSchemeContextValue = {
  alwaysDark: boolean;
  setAlwaysDark: (value: boolean) => void;
  isReady: boolean; // Indicates AsyncStorage has been read at least once
};

const defaultValue: ColorSchemeContextValue = {
  alwaysDark: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAlwaysDark: () => {},
  isReady: false,
};

const STORAGE_KEY = 'pref:alwaysDark';

const ColorSchemeContext =
  createContext<ColorSchemeContextValue>(defaultValue);

export function ColorSchemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [alwaysDark, setAlwaysDarkState] = useState<boolean>(
    defaultValue.alwaysDark
  );
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load initial value from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw != null) {
          setAlwaysDarkState(raw === '1');
        }
      } catch (e) {
        // Ignore storage errors and use default
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Persist changes
  const setAlwaysDark = useCallback((value: boolean) => {
    setAlwaysDarkState(value);
    // Fire and forget persistence
    AsyncStorage.setItem(STORAGE_KEY, value ? '1' : '0').catch(() => {
      // Ignore persistence errors
    });
  }, []);

  const value = useMemo(
    () => ({ alwaysDark, setAlwaysDark, isReady }),
    [alwaysDark, setAlwaysDark, isReady]
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorSchemeOverride() {
  return useContext(ColorSchemeContext);
}

export { ColorSchemeContext };
