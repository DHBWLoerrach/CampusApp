import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ui/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const background = useThemeColor({}, "background");
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const sheetProgress = useRef(new Animated.Value(visible ? 0 : 1)).current;
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const AnimatedPressable = useRef(
    Animated.createAnimatedComponent(Pressable)
  ).current;

  useEffect(() => {
    if (visible && !isMounted) {
      setIsMounted(true);
      return;
    }

    if (!isMounted) return;

    const toValue = visible ? 0 : 1;
    const fadeTo = visible ? 1 : 0;

    const sheetDuration = visible ? 360 : 300;
    const sheetEasing = visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic);
    const backdropDuration = visible ? 240 : 200;
    const backdropEasing = visible
      ? Easing.out(Easing.cubic)
      : Easing.in(Easing.cubic);

    Animated.parallel([
      Animated.timing(sheetProgress, {
        toValue,
        duration: sheetDuration,
        easing: sheetEasing,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: fadeTo,
        duration: backdropDuration,
        easing: backdropEasing,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      if (!visible) {
        setIsMounted(false);
      }
    });
  }, [visible, isMounted, sheetProgress, backdropOpacity]);

  const sheetTranslateY = sheetProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, screenHeight)],
  });

  return (
    <Modal
      visible={isMounted}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <AnimatedPressable
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Sheet schließen"
        accessibilityHint="Schließt die eingeblendeten Informationen"
      >
        {/* spacer to capture taps; sheet stops propagation below */}
      </AnimatedPressable>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: background,
            paddingBottom: Math.max(16, insets.bottom + 12),
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
        accessibilityViewIsModal
      >
        <View style={styles.handle} accessibilityElementsHidden />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  content: {
    maxHeight: "100%",
  },
});
