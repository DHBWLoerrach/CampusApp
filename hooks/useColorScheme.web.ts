import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorSchemeOverride } from '@/context/ColorSchemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { alwaysDark } = useColorSchemeOverride();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return alwaysDark ? 'dark' : colorScheme;
  }

  return alwaysDark ? 'dark' : 'light';
}
