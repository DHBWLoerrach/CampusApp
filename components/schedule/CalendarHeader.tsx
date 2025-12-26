import type { FC } from "react";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { runOnJS, useAnimatedReaction } from "react-native-reanimated";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/ui/IconSymbol";

const ICON_SIZE = Platform.OS === "ios" ? 16 : 24;

interface HeaderProps {
  currentDate: SharedValue<string>;
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
  const [title, setTitle] = useState("");

  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  const updateTitle = (date: string) => {
    const formatted = new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
    });
    setTitle(formatted);
  };

  useAnimatedReaction(
    () => currentDate.value,
    (value) => {
      runOnJS(updateTitle)(value);
    },
    [],
  );

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
          <TouchableOpacity hitSlop={8} onPress={onPressPrevious}>
            <IconSymbol
              size={ICON_SIZE}
              name="chevron.left"
              color={tintColor}
            />
          </TouchableOpacity>
          <TouchableOpacity hitSlop={8} onPress={onPressNext}>
            <IconSymbol
              size={ICON_SIZE}
              name="chevron.right"
              color={tintColor}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerTitle, { color: tintColor }]}>{title}</Text>
        <TouchableOpacity
          hitSlop={8}
          activeOpacity={0.6}
          onPress={onPressToday}
        >
          <Text style={[styles.headerTitle, { color: tintColor }]}>
            {Platform.OS === "android" ? "HEUTE" : "Heute"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerRightContent: {
    flexDirection: "row",
    flexGrow: 1,
    alignItems: "center",
    flexShrink: 1,
  },
  headerTitle: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
