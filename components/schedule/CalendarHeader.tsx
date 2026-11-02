import type { FC } from 'react';
import { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

const ICON_SIZE = Platform.OS === 'ios' ? 16 : 24;
// Minimum touch target: 44 pt (Apple HIG) and 48 dp (Material Design)
const MIN_TOUCH_SIZE = Platform.OS === 'ios' ? 44 : 48;

interface HeaderProps {
  currentDate: string;
  onPressToday?: () => void;
  onPressPrevious?: () => void;
  onPressNext?: () => void;
}

const Header: FC<HeaderProps> = ({
  currentDate,
  onPressToday,
  onPressPrevious,
  onPressNext,
}) => {
  const accentColor = useThemeColor({}, 'accentText');
  const backgroundColor = useThemeColor({}, 'background');

  const title = useMemo(() => {
    if (!currentDate) return '';
    return new Date(currentDate).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
    });
  }, [currentDate]);

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: backgroundColor,
        },
      ]}
    >
      <View style={styles.headerRightContent}>
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={onPressPrevious}
            accessibilityRole="button"
            accessibilityLabel="Vorheriger Zeitraum"
          >
            <IconSymbol
              size={ICON_SIZE}
              name="chevron.left"
              color={accentColor}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={onPressNext}
            accessibilityRole="button"
            accessibilityLabel="Nächster Zeitraum"
          >
            <IconSymbol
              size={ICON_SIZE}
              name="chevron.right"
              color={accentColor}
            />
          </TouchableOpacity>
        </View>
        <Text
          style={[styles.headerTitle, { color: accentColor }]}
          accessibilityRole="header"
        >
          {title}
        </Text>
        <TouchableOpacity
          style={styles.todayButton}
          activeOpacity={0.6}
          onPress={onPressToday}
          accessibilityRole="button"
          accessibilityLabel="Heute"
          accessibilityHint="Springt zum heutigen Datum"
        >
          <Text style={[styles.todayText, { color: accentColor }]}>
            {Platform.OS === 'android' ? 'HEUTE' : 'Heute'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // No horizontal padding: the touch targets around the arrows and
    // "Heute" already inset the visible content from the screen edges
  },
  headerRightContent: {
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    flexShrink: 1,
  },
  headerTitle: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    minWidth: MIN_TOUCH_SIZE,
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
