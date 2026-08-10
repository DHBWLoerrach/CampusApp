import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ClosureInfo } from '@/lib/canteenClosures';
import NfcButton from '@/components/canteen/NfcButton';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// Shown instead of the weekday tabs while every day of the rolling window falls
// into a canteen closure. Without meals to browse the tabs carry no
// information, so the closure gets the whole screen.
export default function CanteenClosedScreen({
  closure,
}: {
  closure: ClosureInfo;
}) {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const badgeBg = useThemeColor({}, 'dayNumberContainer');
  const insets = useSafeAreaInsets();
  const showNfc = ['android', 'ios'].includes(Platform.OS);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.inner}>
          <View
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <IconSymbol
              name="fork.knife"
              size={48}
              color={iconColor}
              style={styles.icon}
            />
          </View>

          <ThemedText type="subtitle" style={styles.title}>
            {closure.title}
          </ThemedText>
          <ThemedText style={styles.range}>{closure.rangeLabel}</ThemedText>

          <View
            accessible
            accessibilityLabel={`${closure.reopeningCaption} ${closure.reopeningLabel}`}
            style={[
              styles.reopening,
              { backgroundColor: badgeBg, borderColor },
            ]}
          >
            <ThemedText style={styles.reopeningCaption}>
              {closure.reopeningCaption}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.reopeningDate, { color: tintColor }]}
            >
              {closure.reopeningLabel}
            </ThemedText>
          </View>

          {closure.note ? (
            <ThemedText style={styles.note}>{closure.note}</ThemedText>
          ) : null}

          {showNfc ? (
            <View style={styles.nfc}>
              <NfcButton />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  // Keeps the text edges aligned on wide viewports (web, tablets) instead of
  // letting each line spread to the full window width.
  inner: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  icon: {
    opacity: 0.6,
  },
  title: {
    marginTop: 16,
    textAlign: 'center',
  },
  range: {
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Stretched so all blocks share one left edge, and the only accented element
  // on the screen: it carries the answer people come here for.
  reopening: {
    marginTop: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: 10,
    borderCurve: 'continuous',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reopeningCaption: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.8,
  },
  reopeningDate: {
    textAlign: 'center',
    marginTop: 2,
    fontSize: 22,
    lineHeight: 28,
  },
  // Left-aligned: centred body copy over several lines flutters on both edges
  // and is hard to scan. Deliberately without a surface of its own so it reads
  // as a side note next to the accented reopening block.
  note: {
    marginTop: 20,
    alignSelf: 'stretch',
    paddingHorizontal: 2,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  nfc: {
    marginTop: 28,
    alignSelf: 'stretch',
  },
});
