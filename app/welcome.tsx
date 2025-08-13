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

export default function WelcomeScreen() {
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: 'Willkommen' }} />

      <Image
        source={require('../assets/images/app/welcome-header.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      <ThemedText style={styles.heading}>
        Willkommen an der DHBW Lörrach
      </ThemedText>

      <ThemedText style={styles.body}>
        News, Vorlesungsplan, Mensa — alles im Blick.
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.label}>Rolle auswählen:</ThemedText>
        <RoleSelection
          role={pendingRole}
          onRoleChange={setPendingRole as any}
        />
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText style={styles.label}>{disclaimerText}</ThemedText>
        <View style={styles.switchRow}>
          <Checkbox
            value={disclaimerChecked}
            onValueChange={setDisclaimerChecked}
            color={disclaimerChecked ? dhbwRed : undefined}
          />
          <Pressable
            onPress={() => setDisclaimerChecked((v) => !v)}
            accessibilityRole="button"
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

      <ThemedView style={styles.footer}>
        <ThemedText
          onPress={onStart}
          style={[
            styles.startButton,
            !disclaimerChecked || !pendingRole
              ? styles.disabled
              : null,
          ]}
        >
          Weiter
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  logo: {
    height: 120,
    width: '100%',
    marginTop: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 8,
  },
  body: {
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    gap: 12,
  },
  checkboxLabel: {
    flexShrink: 1,
  },
  footer: {
    alignItems: 'flex-end',
  },
  startButton: {
    backgroundColor: dhbwRed,
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
});
