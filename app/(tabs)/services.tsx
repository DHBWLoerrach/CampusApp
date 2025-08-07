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
          shadowOpacity: isDark ? 0.12 : 0.25,
          shadowRadius: isDark ? 4 : 8,
          shadowOffset: { width: 0, height: isDark ? 2 : 6 },
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

const services = [
  { title: 'Anreise', icon: 'mappin.and.ellipse' },
  { title: '360°-Tour', icon: 'binoculars' },
  { title: 'Gebäude Hangstraße', icon: 'map' },
  { title: 'Sicherheit', icon: 'shield' },
  {
    title: 'Hausordnung',
    icon: 'exclamationmark.triangle.text.page',
  },
  { title: 'Service-Zugänge', icon: 'link' },
  { title: 'Hilfe im Notfall', icon: 'phone' },
  { title: 'Studium', icon: 'graduationcap' },
  { title: 'Katalog Bibliothek', icon: 'books.vertical' },
  { title: 'Angebote bei der KBC', icon: 'building' },
  { title: 'Freizeit', icon: 'sun.max' },
  { title: 'Feedback', icon: 'envelope' },
  { title: 'Einstellungen', icon: 'gearshape' },
  { title: 'Über', icon: 'info.square' },
  { title: 'Haftung', icon: 'exclamationmark.triangle' },
  { title: 'Impressum', icon: 'text.page' },
  { title: 'Datenschutz', icon: 'eye' },
] as const;

export default function ServicesScreen() {
  const handlePress = (name: string) =>
    console.log(`Pressed: ${name}`);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {services.map(({ title, icon }) => (
            <ServiceCard
              key={title}
              title={title}
              icon={icon}
              onPress={() => handlePress(title)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    height: 110,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
