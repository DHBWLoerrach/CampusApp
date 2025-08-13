import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import RoleSelection from '@/components/services/RoleSelection';
import { useRoleContext } from '@/context/RoleContext';
import { dhbwRed } from '@/constants/Colors';
import { disclaimerText } from '@/constants/InfoTexts';
import type { Role } from '@/constants/Roles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [showDisclaimerDetails, setShowDisclaimerDetails] =
    useState(false);
  const { setSelectedRole, setAcceptedTerms } = useRoleContext();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const onStart = async () => {
    if (!disclaimerChecked || !pendingRole) return;
    await Promise.all([
      setSelectedRole(pendingRole),
      setAcceptedTerms(true),
    ]);
    router.replace('/(tabs)/news');
  };

  const disabled = !disclaimerChecked || !pendingRole;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Willkommen' }} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 96 },
        ]}
      >
        <View style={styles.headerImageContainer}>
          <Image
            source={require('../assets/images/app/welcome-header.png')}
            style={styles.headerImage}
            resizeMode="cover"
          />
          {/* Circular DHBW logo overlay at the top-left */}
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.headerLogo}
            accessibilityLabel="DHBW Logo"
          />
        </View>

        <ThemedText style={styles.heading}>
          Willkommen an der DHBW Lörrach
        </ThemedText>

        <ThemedText style={styles.body}>
          News, Vorlesungsplan, Mensa – alles im Blick.
        </ThemedText>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.label}>
            Preisgruppe für die Mensa auswählen
          </ThemedText>
          <RoleSelection
            role={pendingRole}
            onRoleChange={setPendingRole as any}
          />
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText style={styles.disclaimerShort}>
            Hinweis: Abweichungen in den Inhalten sind möglich.
            Maßgeblich ist der Online-Vorlesungsplan.
          </ThemedText>

          {showDisclaimerDetails ? (
            <ThemedText style={styles.disclaimerDetails}>
              {disclaimerText}
            </ThemedText>
          ) : null}

          <Pressable
            onPress={() => setShowDisclaimerDetails((v) => !v)}
            accessibilityRole="button"
            hitSlop={8}
          >
            <ThemedText style={styles.disclaimerLink}>
              {showDisclaimerDetails
                ? 'Details ausblenden'
                : 'Details anzeigen'}
            </ThemedText>
          </Pressable>

          <View style={styles.acceptTermsRow}>
            <Checkbox
              value={disclaimerChecked}
              onValueChange={setDisclaimerChecked}
              color={disclaimerChecked ? dhbwRed : undefined}
            />
            <Pressable
              onPress={() => setDisclaimerChecked((v) => !v)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: disclaimerChecked }}
              style={styles.checkboxLabel}
              hitSlop={8}
            >
              <ThemedText>
                Ich habe die Hinweise gelesen und stimme zu.
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>

      <ThemedView
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            paddingHorizontal: 16,
          },
        ]}
      >
        <Pressable
          onPress={onStart}
          disabled={disabled}
          style={[
            styles.startButton,
            disabled && styles.startButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
        >
          <ThemedText style={styles.startButtonLabel}>
            Weiter
          </ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const SPACING = 12;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: SPACING,
    gap: SPACING,
  },
  headerImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    overflow: 'hidden',
    borderRadius: 12,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerLogo: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fff',
    opacity: 0.8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  disclaimerShort: {
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimerDetails: {
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimerLink: {
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  acceptTermsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  checkboxLabel: {
    flexShrink: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  startButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: dhbwRed,
  },
  startButtonDisabled: {
    opacity: 0.5, // nicht nur Farbe als Hinweis
  },
  startButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
