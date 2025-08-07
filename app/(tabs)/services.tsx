import { StyleSheet, View } from 'react-native';

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
    <View style={styles.container}>
      <ServiceCard title="Anreise" icon="mappin.and.ellipse" />
      <ServiceCard title="360°-Tour" icon="binoculars" />
      <ServiceCard title="Gebäude Hangstraße" icon="map" />
      <ServiceCard title="Sicherheit" icon="shield" />
      <ServiceCard
        title="Hausordnung"
        icon="exclamationmark.triangle.text.page"
      />
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
    </View>
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
