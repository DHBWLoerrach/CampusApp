import { ReactNode, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { BottomSheet as NativeBottomSheet, RNHostView } from '@expo/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const SHEET_HORIZONTAL_PADDING = 20;
// Share of the window the sheet content may take before it scrolls.
const SHEET_MAX_HEIGHT_RATIO = 0.8;
// Keeps the content mounted while the native dismiss animation runs, so the
// sheet does not collapse to an empty frame on its way out.
const UNMOUNT_DELAY_MS = 400;

/**
 * A native bottom sheet (SwiftUI sheet on iOS, Material 3 ModalBottomSheet on
 * Android) with a title and scrollable React Native content.
 */
export default function BottomSheet({
  visible,
  title,
  titleContent,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  titleContent?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const background = useThemeColor({}, 'background');
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  // The native sheet stays in the tree while hidden, so the content is only
  // mounted while it is shown. Closed sheets must not run their content, e.g.
  // the ride matches would otherwise fetch on every schedule visit.
  const [contentMounted, setContentMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setContentMounted(true);
      return;
    }
    const timeout = setTimeout(
      () => setContentMounted(false),
      UNMOUNT_DELAY_MS
    );
    return () => clearTimeout(timeout);
  }, [visible]);

  const maxContentHeight =
    (windowHeight - insets.top - insets.bottom) * SHEET_MAX_HEIGHT_RATIO;

  return (
    <NativeBottomSheet
      isPresented={visible}
      onDismiss={onClose}
      containerColor={background}
      contentPadding={0}
    >
      {contentMounted ? (
        <RNHostView matchContents={{ vertical: true }}>
          <View style={[styles.content, { maxHeight: maxContentHeight }]}>
            <View style={styles.titleContainer}>
              {titleContent ?? (
                <ThemedText style={styles.title} accessibilityRole="header">
                  {title}
                </ThemedText>
              )}
            </View>
            <ScrollView
              style={styles.scroll}
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {children}
            </ScrollView>
          </View>
        </RNHostView>
      ) : null}
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    paddingHorizontal: SHEET_HORIZONTAL_PADDING,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
