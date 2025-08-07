import {
  StyleSheet,
  View,
  TouchableOpacity,
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
          <ServiceCard
            title="Anreise"
            icon="mappin.and.ellipse"
            onPress={() => handleServicePress('Anreise')}
          />
          <ServiceCard
            title="360°-Tour"
            icon="binoculars"
            onPress={() => handleServicePress('360°-Tour')}
          />
          <ServiceCard
            title="Gebäude Hangstraße"
            icon="map"
            onPress={() => handleServicePress('Gebäude Hangstraße')}
          />
          <ServiceCard
            title="Sicherheit"
            icon="shield"
            onPress={() => handleServicePress('Sicherheit')}
          />
          <ServiceCard
            title="Hausordnung"
            icon="exclamationmark.triangle.text.page"
            onPress={() => handleServicePress('Hausordnung')}
          />
          <ServiceCard
            title="Service-Zugänge"
            icon="link"
            onPress={() => handleServicePress('Service-Zugänge')}
          />
          <ServiceCard
            title="Hilfe im Notfall"
            icon="phone"
            onPress={() => handleServicePress('Hilfe im Notfall')}
          />
          <ServiceCard
            title="Studium"
            icon="graduationcap"
            onPress={() => handleServicePress('Studium')}
          />
          <ServiceCard
            title="Katalog Bibliothek"
            icon="books.vertical"
            onPress={() => handleServicePress('Katalog Bibliothek')}
          />
          <ServiceCard
            title="Angebote bei der KBC"
            icon="building"
            onPress={() => handleServicePress('Angebote bei der KBC')}
          />
          <ServiceCard
            title="Freizeit"
            icon="sun.max"
            onPress={() => handleServicePress('Freizeit')}
          />
          <ServiceCard
            title="Feedback"
            icon="envelope"
            onPress={() => handleServicePress('Feedback')}
          />
          <ServiceCard
            title="Einstellungen"
            icon="gearshape"
            onPress={() => handleServicePress('Einstellungen')}
          />
          <ServiceCard
            title="Über"
            icon="info.square"
            onPress={() => handleServicePress('Über')}
          />
          <ServiceCard
            title="Haftung"
            icon="exclamationmark.triangle"
            onPress={() => handleServicePress('Haftung')}
          />
          <ServiceCard
            title="Impressum"
            icon="text.page"
            onPress={() => handleServicePress('Impressum')}
          />
          <ServiceCard
            title="Datenschutz"
            icon="eye"
            onPress={() => handleServicePress('Datenschutz')}
          />
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
    overflow: 'hidden', // important for rounded corners
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
