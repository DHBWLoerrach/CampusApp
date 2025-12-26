import { ReactNode } from "react";
import { Modal, View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ui/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

// Generic reusable modal
export default function InfoModal({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const background = useThemeColor({}, "background");
  const iconColor = useThemeColor({}, "text");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.content, { backgroundColor: background }]}>
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Schließen"
          >
            <IconSymbol name="xmark.circle.fill" size={32} color={iconColor} />
          </Pressable>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    borderRadius: 20,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: "88%",
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
});
