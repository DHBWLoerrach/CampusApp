import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import {
  IconSymbol,
  type IconSymbolName,
} from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

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
          shadowOpacity: isDark ? 0.12 : 0.25,
          shadowRadius: isDark ? 4 : 8,
          shadowOffset: { width: 0, height: isDark ? 2 : 6 },
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
        <IconSymbol
          size={32}
          name={icon}
          color={Colors[scheme ?? 'light'].icon}
        />
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
    important?: boolean;
  }[];
};

const serviceGroups: ServiceGroup[] = [
  {
    title: 'Campus-Orientierung',
    services: [
      { title: 'Anreise', icon: 'mappin.and.ellipse' },
      { title: 'Gebäude Hangstraße', icon: 'map' },
      { title: '360°-Tour', icon: 'binoculars' },
    ],
  },
  {
    title: 'Rund ums Studium',
    services: [
      { title: 'Studium', icon: 'graduationcap' },
      { title: 'Links zu DHBW-Diensten', icon: 'link' },
      { title: 'Katalog Bibliothek', icon: 'books.vertical' },
      { title: 'Mittagessen bei der KBC', icon: 'building' },

      { title: 'Freizeit', icon: 'sun.max' },
    ],
  },
  {
    title: 'Sicherheit',
    services: [
      { title: 'Sicherheit', icon: 'shield' },
      { title: 'Hilfe im Notfall', icon: 'phone', important: true },
      {
        title: 'Hausordnung',
        icon: 'exclamationmark.triangle.text.page',
      },
    ],
  },
  {
    title: 'App-Infos',
    services: [
      { title: 'Einstellungen', icon: 'gearshape' },
      { title: 'Über', icon: 'info.square' },
      { title: 'Feedback', icon: 'envelope' },
      { title: 'Haftung', icon: 'exclamationmark.triangle' },
      { title: 'Impressum', icon: 'text.page' },
      { title: 'Datenschutz', icon: 'eye' },
    ],
  },
] as const;

export default function ServicesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const handlePress = (name: string) =>
    console.log(`Pressed: ${name}`);

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
              {group.services.map(({ title, icon, important }) => (
                <ServiceCard
                  key={title}
                  title={title}
                  icon={icon}
                  onPress={() => handlePress(title)}
                  important={important}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
    width: 98,
    height: 98,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
});
