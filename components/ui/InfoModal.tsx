import { ReactNode } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

// Generic reusable modal for displaying long-form text content.
export function InfoModal({
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
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      presentationStyle={
        Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'
      }
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.content,
            { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
          ]}
        >
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Schließen"
          >
            <IconSymbol
              name="xmark.circle.fill"
              size={32}
              color={isDark ? '#FFFFFF' : '#333333'}
            />
          </Pressable>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            // Using persistentScrollbar can help debugging layout
            persistentScrollbar={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    borderRadius: 20,
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '88%',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  scroll: {
    // Ensure the scroll view can grow but does not collapse to zero height
    alignSelf: 'stretch',
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: 12,
  },
});
