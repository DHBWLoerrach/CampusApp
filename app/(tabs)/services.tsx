import { StyleSheet, View } from 'react-native';

import {
  type IconSymbolName,
  IconSymbol,
} from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Karte mit Icon und Titel für den Services-Bildschirm
function ServiceCard({
  title,
  icon,
}: {
  title: string;
  icon: IconSymbolName;
}) {
  const colorScheme = useColorScheme();

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
    >
      <IconSymbol
        size={28}
        name={icon}
        color={Colors[colorScheme ?? 'light'].icon}
      />
      <ThemedText>{title}</ThemedText>
    </View>
  );
}

export default function ServicesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Services</ThemedText>
      </ThemedView>
      <ServiceCard title="Anreise" icon="location" />
      <ServiceCard title="360°-Tour" icon="binoculars" />
      <ServiceCard title="Gebäude Hangstraße" icon="map" />
      <ServiceCard title="Sicherheit" icon="shield" />
      <ServiceCard title="Hausordnung" icon="building.columns" />
      <ServiceCard title="Service-Zugänge" icon="link" />
      <ServiceCard title="Hilfe im Notfall" icon="phone" />
      <ServiceCard title="Studium" icon="graduationcap" />
      <ServiceCard title="Katalog Bibliothek" icon="books.vertical" />
      <ServiceCard title="Angebote bei der KBC" icon="building" />
      <ServiceCard title="Freizeit" icon="sun.max" />
      <ServiceCard title="Feedback" icon="envelope" />
      <ServiceCard title="Einstellungen" icon="gearshape" />
      <ServiceCard title="Über" icon="info.square" />
      <ServiceCard title="Haftung" icon="exclamationmark.triangle" />
      <ServiceCard title="Impressum" icon="text.page" />
      <ServiceCard title="Datenschutz" icon="eye" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
