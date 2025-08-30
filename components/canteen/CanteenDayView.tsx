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
  dateFromOffset,
  fetchCanteenRaw,
  mealsForDate,
  normalizeCanteenData,
} from '@/lib/canteenService';
import NfcButton from '@/components/canteen/NfcButton';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export default function CanteenDayView({
  offset = 0,
}: {
  offset?: number;
}) {
  const date = dateFromOffset(offset);
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
    ? mealsForDate(data.days, date)
    : [];

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
      ) : meals.length === 0 ? (
        <View style={styles.center}>
          <ThemedText type="defaultSemiBold" style={styles.hint}>
            Kein Speiseplan für {format(date, 'dd.MM.yyyy')} gefunden.
          </ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {meals.map((m, idx) => (
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
              {m.prices && Object.keys(m.prices).length > 0 ? (
                <View style={styles.pricesRow}>
                  {Object.entries(m.prices).map(([k, v]) => (
                    <ThemedText
                      key={k}
                      style={styles.price}
                    >{`${k}: ${v}`}</ThemedText>
                  ))}
                </View>
              ) : null}
            </ThemedView>
          ))}
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
