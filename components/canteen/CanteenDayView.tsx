import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CanteenDay,
  CanteenMeal,
  fetchCanteenRaw,
  mealsForDate,
  normalizeCanteenData,
  priceForRole,
} from '@/lib/canteenService';
import { getCanteenClosure } from '@/lib/canteenClosures';
import NfcButton from '@/components/canteen/NfcButton';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useRoleContext } from '@/context/RoleContext';
import type { Role } from '@/constants/Roles';

function resolveMealPriceValue(
  prices: CanteenMeal['prices'],
  role: ReturnType<typeof useRoleContext>['selectedRole']
): string | number | undefined {
  const fallbackRole: Role = 'Gast';
  const pr = priceForRole(
    prices as Record<string, string | number> | undefined,
    role ?? fallbackRole
  );
  if (pr) return pr.value;
  return undefined;
}

export default function CanteenDayView({ date }: { date: Date }) {
  const safeDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  const { selectedRole } = useRoleContext();
  const { data, isLoading, error, refetch } = useQuery<
    { days: CanteenDay[] },
    Error
  >({
    queryKey: ['canteen-swfr'],
    queryFn: async () => {
      const raw = await fetchCanteenRaw();
      const days = normalizeCanteenData(raw);
      return { days };
    },
  });

  const meals: CanteenMeal[] = data?.days
    ? mealsForDate(data.days, safeDate)
    : [];
  const closure = getCanteenClosure(safeDate);

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <ThemedText style={styles.hint}>
            Lade Speiseplan …
          </ThemedText>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <ThemedText type="defaultSemiBold" style={styles.error}>
            Fehler beim Laden des Speiseplans
          </ThemedText>
          <ThemedText>{error.message}</ThemedText>
          <ThemedText style={styles.link} onPress={() => refetch()}>
            Erneut versuchen
          </ThemedText>
        </View>
      ) : closure ? (
        <View style={styles.center}>
          <ThemedText type="defaultSemiBold" style={styles.hint}>
            Mensa am {format(safeDate, 'dd.MM.yyyy')} geschlossen.
          </ThemedText>
          {closure.reason ? (
            <ThemedText style={styles.small}>{closure.reason}</ThemedText>
          ) : null}
        </View>
      ) : meals.length === 0 ? (
        <View style={styles.center}>
          <ThemedText type="defaultSemiBold" style={styles.hint}>
            Kein Speiseplan für {format(safeDate, 'dd.MM.yyyy')} gefunden.
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {meals.map((m, idx) => {
            const priceValue = resolveMealPriceValue(m.prices, selectedRole);
            return (
              <ThemedView key={idx} style={styles.card}>
                {m.category ? (
                  <ThemedText style={styles.category}>
                    {m.category}
                  </ThemedText>
                ) : null}
                <ThemedText type="defaultSemiBold" style={styles.title}>
                  {m.title}
                </ThemedText>
                {m.notes ? (
                  <ThemedText style={styles.notes}>
                    {m.notes}
                  </ThemedText>
                ) : null}
                {priceValue != null ? (
                  <View style={styles.pricesRow}>
                    <ThemedText style={styles.price}>{`${priceValue}`}</ThemedText>
                  </View>
                ) : null}
              </ThemedView>
            );
          })}
        </ScrollView>
      )}

      {['android', 'ios'].includes(Platform.OS) && (
        <View style={styles.nfcContainer}>
          <NfcButton />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  category: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
  },
  notes: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  pricesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  price: {
    fontSize: 12,
    opacity: 0.9,
  },
  error: {
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
  },
  small: {
    fontSize: 12,
    opacity: 0.7,
  },
  link: {
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  nfcContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
});
