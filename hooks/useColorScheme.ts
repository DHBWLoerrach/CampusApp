import { useColorScheme as useRNColorScheme } from "react-native";
import { useColorSchemeOverride } from "@/context/ColorSchemeContext";

// Hook that respects the manual override (alwaysDark)
export function useColorScheme() {
  const scheme = useRNColorScheme();
  const { alwaysDark } = useColorSchemeOverride();
  if (alwaysDark) return "dark";
  return scheme;
}
