import { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
  Image,
  Modal,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  IconSymbol,
  type IconSymbolName,
} from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { Colors, dhbwRed } from '@/constants/Colors';
import InfoModal from '@/components/services/InfoModal';
import ImageModal from '@/components/services/ImageModal';
import {
  INFO_PAGES,
  type InfoKey,
} from '@/components/services/InfoPages';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';

const handleOpen = async (url: string) => {
  if (!url) return;

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle:
        WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, //iOS
      controlsColor: dhbwRed, // iOS
      createTask: false, // Android
      showTitle: false, // Android
    });
  }
};

function ServiceCard({
  title,
  icon,
  onPress,
  important,
}: {
  title: string;
  icon: IconSymbolName;
  onPress?: () => void;
  important?: boolean;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderColor: isDark
            ? 'rgba(255,255,255,0.12)'
            : Colors[scheme ?? 'light'].border,
          /* iOS */
          shadowColor: isDark ? '#FFFFFF' : '#000000',
          shadowOpacity: 0.15,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          /* Android */
          elevation: Platform.OS === 'android' && !isDark ? 12 : 0,
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
        important && {
          borderColor: Colors[scheme ?? 'light'].tint,
          borderWidth: StyleSheet.hairlineWidth,
        },
      ]}
      onPress={onPress}
      android_ripple={{
        color: Colors[scheme ?? 'light'].tint + '30',
        radius: 120,
      }}
      accessible
      accessibilityLabel={`${title} Service`}
      accessibilityHint={`Öffnet den ${title} Service`}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <IconSymbol
            size={32}
            name={icon}
            color={Colors[scheme ?? 'light'].icon}
          />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

type ServiceGroup = {
  title: string;
  services: {
    title: string;
    icon: IconSymbolName;
    important?: boolean;
    url?: string;
    image?: any;
    content?: InfoKey;
  }[];
};

const serviceGroups: ServiceGroup[] = [
  {
    title: 'Campus-Orientierung',
    services: [
      {
        title: 'Standorte und Anreise',
        icon: 'mappin.and.ellipse',
        url: 'https://dhbw-loerrach.de/kontakt/standorte#inhalt',
      },
      {
        title: 'Gebäude Hangstraße',
        icon: 'map',
        image: require('@/assets/images/app/campus-hangstr.jpg'),
      },
      {
        title: '360°-Tour',
        icon: 'binoculars',
        url: 'https://dhbw-loerrach.de/player360',
      },
    ],
  },
  {
    title: 'Rund ums Studium',
    services: [
      {
        title: 'Webmail',
        icon: 'envelope.open',
        url: 'https://webmail.dhbw-loerrach.de',
      },
      {
        title: 'Moodle',
        icon: 'graduationcap',
        url: 'https://moodle.loerrach.dhbw.de',
      },
      {
        title: 'DUALIS (Noten)',
        icon: 'chart.bar',
        url: 'https://dualis.dhbw.de/',
      },
      {
        title: 'StuV',
        icon: 'person.3',
        url: 'https://stuv-loerrach.de',
      },
      {
        title: 'Katalog der Bibliothek',
        icon: 'books.vertical',
        url: 'https://bsz.ibs-bw.de/aDISWeb/app?service=direct/0/Home/$DirectLink&sp=SOPAC18',
      },
      {
        title: 'Weitere Links…',
        icon: 'link',
      },
    ],
  },
  {
    title: 'Sicherheit',
    services: [
      { title: 'Hilfe im Notfall', icon: 'phone', important: true },
      { title: 'Sicherheit', icon: 'shield' },
      {
        title: 'Hausordnung',
        icon: 'building',
        url: 'https://dhbw-loerrach.de/hausordnung',
      },
    ],
  },
  {
    title: 'App-Infos',
    services: [
      { title: 'Einstellungen', icon: 'gearshape' },
      { title: 'Feedback', icon: 'envelope' },
      { title: 'Über', icon: 'info.square', content: 'about' },
      {
        title: 'Haftung',
        icon: 'exclamationmark.triangle',
        content: 'disclaimer',
      },
      { title: 'Impressum', icon: 'text.page', content: 'imprint' },
      { title: 'Datenschutz', icon: 'eye', content: 'privacy' },
    ],
  },
] as const;

export default function ServicesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const router = useRouter();
  const handlePress = (name: string) => {
    if (name === 'Weitere Links…') {
      router.push('/services/study-links');
    } else if (name === 'Sicherheit') {
      router.push('/services/safety');
    } else {
      console.log(`Pressed: ${name}`);
    }
  };

  const [imageModal, setImageModal] = useState<{
    title: string;
    source: any;
  } | null>(null);
  const [infoKey, setInfoKey] = useState<InfoKey | null>(null);
  const Active = useMemo(
    () => (infoKey ? INFO_PAGES[infoKey].Body : null),
    [infoKey]
  );
  const title = infoKey ? INFO_PAGES[infoKey].title : '';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {serviceGroups.map((group) => (
          <View key={group.title} style={styles.section}>
            <ThemedText
              style={[
                styles.sectionTitle,
                { color: isDark ? '#FFFFFF' : '#333333' },
              ]}
            >
              {group.title}
            </ThemedText>
            <View style={styles.grid}>
              {group.services.map(
                ({ title, icon, important, url, image, content }) => (
                  <ServiceCard
                    key={title}
                    title={title}
                    icon={icon}
                    onPress={() => {
                      if (image) {
                        setImageModal({ title, source: image });
                      } else if (url) {
                        handleOpen(url);
                      } else if (content) {
                        setInfoKey(content);
                      } else {
                        handlePress(title);
                      }
                    }}
                    important={important}
                  />
                )
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={!!imageModal}
        animationType="slide"
        transparent
        onRequestClose={() => setImageModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#121212' : '#FFFFFF' },
            ]}
          >
            <Pressable
              onPress={() => setImageModal(null)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Schließen"
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={32}
                color={isDark ? '#FFFFFF' : '#333333'}
              />
            </Pressable>
            {imageModal && (
              <Image
                source={imageModal.source}
                style={styles.modalImage}
                resizeMode="contain"
                accessible
                accessibilityLabel={imageModal.title}
              />
            )}
            <ThemedText style={styles.modalCaption}>
              {imageModal?.title}
            </ThemedText>
          </View>
        </View>
      </Modal>

      {/* Generic info modal */}
      <InfoModal
        visible={!!infoKey}
        title={title}
        onClose={() => setInfoKey(null)}
      >
        {Active ? <Active /> : null}
      </InfoModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: 116,
    height: 88,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    paddingTop: 12,
  },
  iconContainer: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 16,
    padding: 12,
    maxHeight: '85%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '75%',
    borderRadius: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  modalCaption: {
    marginTop: 12,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});
