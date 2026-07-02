import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { IconSymbol, type IconSymbolName } from '@/components/ui/IconSymbol';
import InfoModal from '@/components/services/InfoModal';
import { INFO_PAGES, type InfoKey } from '@/components/services/InfoPages';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { openLink } from '@/lib/utils';

function ServiceCard({
  title,
  displayTitle,
  icon,
  onPress,
}: {
  title: string;
  displayTitle?: string;
  icon: IconSymbolName;
  onPress?: () => void;
}) {
  const cardBg = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const visibleTitle = displayTitle ?? title;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: borderColor,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          opacity: process.env.EXPO_OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      android_ripple={{
        color: Colors.light.tint + '30',
        radius: 120,
      }}
      accessible
      accessibilityLabel={`${title} Service`}
      accessibilityHint={`Öffnet den ${title} Service`}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <IconSymbol size={32} name={icon} color={iconColor} />
        </View>
        {/* Required so the soft hyphens in `displayTitle` break on Android;
            iOS/Web ignore this prop but honor the soft hyphens directly. */}
        <ThemedText
          style={styles.cardTitle}
          android_hyphenationFrequency="normal"
        >
          {visibleTitle}
        </ThemedText>
      </View>
    </Pressable>
  );
}

type ServiceGroup = {
  title: string;
  services: {
    title: string;
    // Presentation-only variant of `title` for line breaking (e.g. soft
    // hyphens). Must match `title` in wording; `title` stays the source of
    // truth for logic, keys and accessibility. Note: soft hyphens only take
    // effect on Android when the rendering Text sets android_hyphenationFrequency.
    displayTitle?: string;
    icon: IconSymbolName;
    url?: string;
    image?: any;
    content?: InfoKey;
    route?: Href;
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
        route: '/services/study-links',
      },
    ],
  },
  {
    title: 'Hilfe und Regeln',
    services: [
      {
        title: 'Beratung und Hilfe',
        icon: 'phone',
        route: '/services/help-links',
      },
      { title: 'Sicherheit', icon: 'shield', route: '/services/safety' },
      {
        title: 'Hausordnung',
        displayTitle: 'Haus\u00ADordnung',
        icon: 'building',
        url: 'https://dhbw-loerrach.de/hausordnung',
      },
    ],
  },
  {
    title: 'App-Infos',
    services: [
      {
        title: 'Einstellungen',
        displayTitle: 'Ein\u00ADstel\u00ADlun\u00ADgen',
        icon: 'gearshape',
        route: '/services/preferences',
      },
      { title: 'Feedback', icon: 'envelope', content: 'feedback' },
      { title: 'Über', icon: 'info.square', content: 'about' },
      {
        title: 'Haftung',
        icon: 'exclamationmark.triangle',
        content: 'disclaimer',
      },
      { title: 'Impressum', icon: 'text.page', content: 'imprint' },
      {
        title: 'Datenschutz',
        displayTitle: 'Daten\u00ADschutz',
        icon: 'eye',
        content: 'privacy',
      },
    ],
  },
] as const;

export default function ServicesScreen() {
  const router = useRouter();

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
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {serviceGroups.map((group) => (
          <View key={group.title} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{group.title}</ThemedText>
            <View style={styles.grid}>
              {group.services.map(
                ({ title, displayTitle, icon, url, image, content, route }) => (
                  <ServiceCard
                    key={title}
                    title={title}
                    displayTitle={displayTitle}
                    icon={icon}
                    onPress={() => {
                      if (image) {
                        setImageModal({ title, source: image });
                      } else if (url) {
                        openLink(url);
                      } else if (content) {
                        setInfoKey(content);
                      } else if (route) {
                        router.push(route);
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
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {Active ? <Active /> : null}
        </ScrollView>
      </InfoModal>
    </ThemedView>
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
    width: 114,
    minHeight: 88,
    borderRadius: 12,
    borderCurve: 'continuous',
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
    lineHeight: 16,
  },
  modalImage: {
    width: '100%',
    height: '70%',
    borderRadius: 12,
    borderCurve: 'continuous',
  },
});
