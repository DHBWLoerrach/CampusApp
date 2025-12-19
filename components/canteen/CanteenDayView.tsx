import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CanteenDay,
  CanteenMeal,
  summarizeAllergensAndLabels,
  fetchCanteenRaw,
  mealsForDate,
  normalizeCanteenData,
  priceForRole,
} from '@/lib/canteenService';
import { getCanteenClosure } from '@/lib/canteenClosures';
import NfcButton from '@/components/canteen/NfcButton';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import OfflineBanner from '@/components/ui/OfflineBanner';
import OfflineEmptyState from '@/components/ui/OfflineEmptyState';
import { useRoleContext } from '@/context/RoleContext';
import type { Role } from '@/constants/Roles';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

function resolveMealPrice(
  prices: CanteenMeal['prices'],
  role: ReturnType<typeof useRoleContext>['selectedRole']
): { label: string; amount: string; display: string } | null {
  const fallbackRole: Role = 'Gast';
  const pr = priceForRole(
    prices as Record<string, string | number> | undefined,
    role ?? fallbackRole
  );
  if (!pr) return null;
  let raw = String(pr.value).trim();
  // remove any existing euro signs and surrounding spaces
  raw = raw.replace(/\s*€\s*/gi, '');
  // normalize decimal separator to comma if only dot is present
  if (raw.includes('.') && !raw.includes(','))
    raw = raw.replace('.', ',');
  const amount = raw;
  const display = `${amount} €`;
  return { label: pr.label, amount, display };
}

type MealTag = {
  key: string;
  label: string;
  kind:
    | 'vegan'
    | 'vegetarian'
    | 'fish'
    | 'beef'
    | 'pork'
    | 'poultry'
    | 'spicy'
    | 'bio'
    | 'alcohol'
    | 'other';
};

function extractMealTags(meal: CanteenMeal): MealTag[] {
  const src = `${meal.title} ${meal.additionalInfo ?? ''} ${
    meal.labels ?? ''
  } ${meal.allergens ?? ''}`.toLowerCase();
  const tags: MealTag[] = [];
  const add = (key: string, label: string, kind: MealTag['kind']) =>
    tags.push({ key, label, kind });

  if (/\bvegan\b/.test(src)) add('vegan', 'Vegan', 'vegan');
  if (/vegetar|\bveg\b/.test(src) && !/\bvegan\b/.test(src))
    add('vegetarian', 'Vegetarisch', 'vegetarian');
  if (/fisch|lachs|seelachs|thunfisch|forelle/.test(src))
    add('fish', 'Fisch', 'fish');
  if (/rind/.test(src)) add('beef', 'Rind', 'beef');
  if (/schwein/.test(src)) add('pork', 'Schwein', 'pork');
  if (/geflügel|hähnchen|huhn|pute|poultry/.test(src))
    add('poultry', 'Geflügel', 'poultry');
  if (/scharf|spicy|chili|pikant/.test(src))
    add('spicy', 'Scharf', 'spicy');
  if (/\bbio\b|\borganic\b/.test(src)) add('bio', 'Bio', 'bio');
  if (/alkohol/.test(src)) add('alcohol', 'Alkohol', 'alcohol');

  return tags;
}

export default function CanteenDayView({ date }: { date: Date }) {
  const safeDate =
    date instanceof Date && !isNaN(date.getTime())
      ? date
      : new Date();
  const { selectedRole } = useRoleContext();
  const tintColor = useThemeColor({}, 'tint');
  const badgeBg = useThemeColor({}, 'dayNumberContainer');
  const badgeBorder = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const isDark = useColorScheme() === 'dark';
  const [expandedMap, setExpandedMap] = useState<
    Record<number, boolean>
  >({});
  const showNfcHeader = ['android', 'ios'].includes(Platform.OS);
  const { isOnline, isOffline, isReady } = useOnlineStatus();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    dataUpdatedAt,
  } = useQuery<{ days: CanteenDay[] }, Error>({
    queryKey: ['canteen-swfr'],
    queryFn: async () => {
      const raw = await fetchCanteenRaw();
      const days = normalizeCanteenData(raw);
      return { days };
    },
  });

  // Auto-refresh when the device comes back online
  const prevOnlineRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!isReady) return;
    const prevOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    const cameBackOnline = prevOnline === false && isOnline === true;
    if (!cameBackOnline) return;

    void refetch();
  }, [isOnline, isReady, refetch]);

  const meals: CanteenMeal[] = data?.days
    ? mealsForDate(data.days, safeDate)
    : [];
  const closure = getCanteenClosure(safeDate);
  const showOffline = isReady && isOffline;
  const hasData = data?.days && data.days.length > 0;

  // Offline + no data: show dedicated empty state
  if (showOffline && !hasData && !isLoading) {
    const onOpenSettings =
      Platform.OS === 'web'
        ? undefined
        : () => {
            void Linking.openSettings();
          };
    return (
      <OfflineEmptyState
        message="Der Speiseplan kann ohne Internetverbindung nicht geladen werden."
        onOpenSettings={onOpenSettings}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <ThemedText style={styles.hint}>
            Lade Speiseplan …
          </ThemedText>
        </View>
      ) : error && !hasData ? (
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
        <>
          <View style={styles.center}>
            <ThemedText type="defaultSemiBold" style={styles.hint}>
              Mensa am {format(safeDate, 'dd.MM.yyyy')} geschlossen.
            </ThemedText>
            {closure.reason ? (
              <ThemedText style={styles.small}>
                {closure.reason}
              </ThemedText>
            ) : null}
            {showNfcHeader ? <NfcButton /> : null}
          </View>
        </>
      ) : meals.length === 0 ? (
        <>
          <View style={styles.center}>
            <ThemedText type="defaultSemiBold" style={styles.hint}>
              Kein Speiseplan für {format(safeDate, 'dd.MM.yyyy')}{' '}
              gefunden.
            </ThemedText>
            {showNfcHeader ? <NfcButton /> : null}
          </View>
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          stickyHeaderIndices={
            showNfcHeader ? [showOffline ? 1 : 0] : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => {
                void refetch();
              }}
              tintColor={tintColor}
            />
          }
        >
          {showOffline && hasData ? (
            <OfflineBanner
              style={styles.banner}
              message={
                dataUpdatedAt
                  ? `Letzte Aktualisierung: ${new Date(
                      dataUpdatedAt
                    ).toLocaleTimeString('de-DE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })} Uhr`
                  : 'Inhalte können nicht aktualisiert werden.'
              }
            />
          ) : null}
          {showNfcHeader ? <NfcButton /> : null}
          {meals.map((m, idx) => {
            const price = resolveMealPrice(m.prices, selectedRole);
            const tags = extractMealTags(m);
            const displayTags = tags.filter(
              (t) => t.kind !== 'vegan' && t.kind !== 'vegetarian'
            );
            const dietTag = tags.find(
              (t) => t.kind === 'vegan' || t.kind === 'vegetarian'
            );
            const showAdditionalInfoChip =
              !!m.additionalInfo &&
              !/vegan|vegetar/i.test(m.additionalInfo);
            const isExpanded = !!expandedMap[idx];
            return (
              <ThemedView
                key={idx}
                style={[styles.card, styles.elevated]}
                lightColor="#fff"
                darkColor="#222"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    {m.category ? (
                      <View style={styles.categoryPill}>
                        <ThemedText style={styles.categoryText}>
                          {m.category}
                        </ThemedText>
                      </View>
                    ) : null}
                    {dietTag ? (
                      <View
                        style={[
                          styles.tagChip,
                          chipStyleFor(dietTag, isDark),
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.tagText,
                            chipTextStyleFor(dietTag),
                          ]}
                          numberOfLines={1}
                        >
                          {dietTag.label}
                        </ThemedText>
                      </View>
                    ) : null}
                    {showAdditionalInfoChip ? (
                      <View style={styles.tagChip}>
                        <ThemedText
                          style={styles.tagText}
                          numberOfLines={1}
                        >
                          {m.additionalInfo}
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>

                  {price ? (
                    <View
                      style={[
                        styles.priceBadge,
                        {
                          backgroundColor: badgeBg,
                          borderColor: badgeBorder,
                        },
                      ]}
                      accessibilityLabel={`Preis: ${price.display}`}
                    >
                      <ThemedText style={styles.priceText}>
                        {price.display}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>

                <ThemedText
                  type="defaultSemiBold"
                  style={styles.title}
                >
                  {m.title}
                </ThemedText>

                {displayTags.length > 0 ? (
                  <View style={styles.tagsRow}>
                    {displayTags.map((t) => (
                      <View
                        key={t.key}
                        style={[
                          styles.tagChip,
                          chipStyleFor(t, isDark),
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.tagText,
                            chipTextStyleFor(t),
                          ]}
                        >
                          {t.label}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}

                {m.labels || m.allergens ? (
                  <>
                    <Pressable
                      onPress={() =>
                        setExpandedMap((prev) => ({
                          ...prev,
                          [idx]: !prev[idx],
                        }))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={
                        isExpanded
                          ? 'Allergene und Zusätze ausblenden'
                          : 'Allergene und Zusätze anzeigen'
                      }
                      hitSlop={8}
                      style={styles.detailsHeaderRow}
                    >
                      <ThemedText
                        style={styles.detailsHeaderLabel}
                        numberOfLines={1}
                      >
                        {`Allergene & Zusätze: ${
                          summarizeAllergensAndLabels(
                            m.labels,
                            m.allergens
                          ) ?? ''
                        }`}
                      </ThemedText>
                      <IconSymbol
                        name="chevron.down"
                        size={16}
                        color={iconColor}
                        style={{
                          transform: [
                            {
                              rotate: isExpanded ? '180deg' : '0deg',
                            },
                          ],
                        }}
                      />
                    </Pressable>
                    {isExpanded ? (
                      <ThemedText style={styles.notes}>
                        {[m.labels, m.allergens]
                          .filter(Boolean)
                          .join(' · ')}
                      </ThemedText>
                    ) : null}
                  </>
                ) : null}
              </ThemedView>
            );
          })}
        </ScrollView>
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
  banner: {
    marginBottom: 4,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
    gap: 12,
  },

  card: {
    borderRadius: 12,
    padding: 14,
  },
  elevated: {
    elevation: 3,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  category: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(127,127,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.25)',
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    opacity: 0.9,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  notes: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 8,
  },
  moreRow: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  detailsHeaderRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  detailsHeaderLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  moreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.25)',
    backgroundColor: 'rgba(127,127,127,0.10)',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
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
});

// Visual styles for chips depending on tag kind
function chipStyleFor(tag: MealTag, isDark?: boolean) {
  switch (tag.kind) {
    case 'vegan':
      return {
        backgroundColor: isDark
          ? 'rgba(46, 125, 50, 0.30)'
          : 'rgba(46, 125, 50, 0.18)',
        borderColor: isDark
          ? 'rgba(46, 125, 50, 0.60)'
          : 'rgba(46, 125, 50, 0.35)',
      } as const;
    case 'vegetarian':
      return {
        backgroundColor: isDark
          ? 'rgba(76, 175, 80, 0.30)'
          : 'rgba(76, 175, 80, 0.18)',
        borderColor: isDark
          ? 'rgba(76, 175, 80, 0.60)'
          : 'rgba(76, 175, 80, 0.35)',
      } as const;
    case 'fish':
      return {
        backgroundColor: isDark
          ? 'rgba(33, 150, 243, 0.30)'
          : 'rgba(33, 150, 243, 0.18)',
        borderColor: isDark
          ? 'rgba(33, 150, 243, 0.60)'
          : 'rgba(33, 150, 243, 0.35)',
      } as const;
    case 'spicy':
      return {
        backgroundColor: isDark
          ? 'rgba(255, 87, 34, 0.30)'
          : 'rgba(255, 87, 34, 0.18)',
        borderColor: isDark
          ? 'rgba(255, 87, 34, 0.60)'
          : 'rgba(255, 87, 34, 0.35)',
      } as const;
    case 'bio':
      return {
        // Teal tone to distinguish from green Vegan/Vegetarisch
        backgroundColor: isDark
          ? 'rgba(0, 137, 123, 0.30)'
          : 'rgba(0, 137, 123, 0.18)',
        borderColor: isDark
          ? 'rgba(0, 137, 123, 0.60)'
          : 'rgba(0, 137, 123, 0.35)',
      } as const;
    case 'alcohol':
      return {
        backgroundColor: isDark
          ? 'rgba(156, 39, 176, 0.30)'
          : 'rgba(156, 39, 176, 0.18)',
        borderColor: isDark
          ? 'rgba(156, 39, 176, 0.60)'
          : 'rgba(156, 39, 176, 0.35)',
      } as const;
    case 'beef':
      return {
        backgroundColor: isDark
          ? 'rgba(121, 85, 72, 0.30)'
          : 'rgba(121, 85, 72, 0.18)',
        borderColor: isDark
          ? 'rgba(121, 85, 72, 0.60)'
          : 'rgba(121, 85, 72, 0.35)',
      } as const;
    case 'pork':
      return {
        backgroundColor: isDark
          ? 'rgba(233, 30, 99, 0.30)'
          : 'rgba(233, 30, 99, 0.18)',
        borderColor: isDark
          ? 'rgba(233, 30, 99, 0.60)'
          : 'rgba(233, 30, 99, 0.35)',
      } as const;
    case 'poultry':
      return {
        backgroundColor: isDark
          ? 'rgba(255, 193, 7, 0.30)'
          : 'rgba(255, 193, 7, 0.18)',
        borderColor: isDark
          ? 'rgba(255, 193, 7, 0.60)'
          : 'rgba(255, 193, 7, 0.35)',
      } as const;
    default:
      return {} as const;
  }
}

function chipTextStyleFor(tag: MealTag) {
  switch (tag.kind) {
    case 'vegan':
    case 'vegetarian':
      return { color: '#2e7d32' } as const;
    case 'fish':
      return { color: '#1976d2' } as const;
    case 'spicy':
      return { color: '#e65100' } as const;
    case 'bio':
      // Darker teal text
      return { color: '#00695C' } as const;
    case 'alcohol':
      return { color: '#7b1fa2' } as const;
    case 'beef':
      return { color: '#6d4c41' } as const;
    case 'pork':
      return { color: '#c2185b' } as const;
    case 'poultry':
      return { color: '#f57f17' } as const;
    default:
      return {} as const;
  }
}
