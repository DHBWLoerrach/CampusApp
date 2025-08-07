import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import {
  type IconSymbolName,
  IconSymbol,
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
  const colorScheme = useColorScheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.serviceCard,
        {
          backgroundColor:
            colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : '#ffffff',
          borderColor: Colors[colorScheme ?? 'light'].border,
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      android_ripple={{
        color: Colors[colorScheme ?? 'light'].tint + '30',
        borderless: false,
        radius: 120,
      }}
      accessible={true}
      accessibilityLabel={`${title} Service`}
      accessibilityHint={`Öffnet den ${title} Service`}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <IconSymbol
          size={32}
          name={icon}
          color={Colors[colorScheme ?? 'light'].tint}
        />
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      </View>
    </Pressable>
  );
}

type Service = {
  title: string;
  icon: IconSymbolName;
};

const services: Service[] = [
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
  const handleServicePress = (serviceName: string) => {
    // TODO: Navigation zu den entsprechenden Unterseiten
    console.log(`Pressed: ${serviceName}`);
  };

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
              onPress={() => handleServicePress(title)}
            />
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32, // extra space at the bottom
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
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
