import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorSchemeOverride } from '@/context/ColorSchemeContext';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { alwaysDark } = useColorSchemeOverride();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    if (alwaysDark) {
      return 'dark';
    }

    return colorScheme === 'dark' ? 'dark' : 'light';
  }

  return alwaysDark ? 'dark' : 'light';
}
