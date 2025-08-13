import { useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  IconSymbol,
  type IconSymbolName,
} from '@/components/ui/IconSymbol';
import InfoModal from '@/components/services/InfoModal';
import {
  INFO_PAGES,
  type InfoKey,
} from '@/components/services/InfoPages';
import { ThemedText } from '@/components/ui/ThemedText';
import { Colors, dhbwRed } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { openLink } from '@/lib/utils';

function ServiceCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: IconSymbolName;
  onPress?: () => void;
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
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      </View>
    </Pressable>
  );
}

type ServiceGroup = {
  title: string;
  services: {
    title: string;
    icon: IconSymbolName;
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
        title: 'StuV',
        icon: 'person.3',
        url: 'https://stuv-loerrach.de',
      },
      {
        title: 'Weitere Links…',
        icon: 'link',
      },
    ],
  },
  {
    title: 'Hilfe und Regeln',
    services: [
      { title: 'Beratung und Hilfe', icon: 'phone' },
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
      { title: 'Feedback', icon: 'envelope', content: 'feedback' },
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
    } else if (name === 'Beratung und Hilfe') {
      router.push('/services/help-links');
    } else if (name === 'Einstellungen') {
      router.push('/services/preferences');
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
                ({ title, icon, url, image, content }) => (
                  <ServiceCard
                    key={title}
                    title={title}
                    icon={icon}
                    onPress={() => {
                      if (image) {
                        setImageModal({ title, source: image });
                      } else if (url) {
                        openLink(url);
                      } else if (content) {
                        setInfoKey(content);
                      } else {
                        handlePress(title);
                      }
                    }}
                  />
                )
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <InfoModal
        visible={!!imageModal}
        title={imageModal?.title || ''}
        onClose={() => setImageModal(null)}
      >
        <Image
          source={imageModal?.source}
          style={styles.modalImage}
          resizeMode="contain"
          accessible
          accessibilityLabel={imageModal?.title || ''}
        />
      </InfoModal>

      <InfoModal
        visible={!!infoKey}
        title={title}
        onClose={() => setInfoKey(null)}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {Active ? <Active /> : null}
        </ScrollView>
      </InfoModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    // Ensure the scroll view can grow but does not collapse to zero height
    alignSelf: 'stretch',
    maxHeight: '100%',
  },
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
    width: 108,
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
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
  },
});
