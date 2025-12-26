import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useScrollToTop } from "@react-navigation/native";
import { formatDistanceToNow, format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedView } from "@/components/ui/ThemedView";
import OfflineBanner from "@/components/ui/OfflineBanner";
import OfflineEmptyState from "@/components/ui/OfflineEmptyState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useThemeColor } from "@/hooks/useThemeColor";
import { dhbwRed } from "@/constants/Colors";
import {
  fetchAndParseRSSFeed,
  type RSSFeed,
  type RSSItem,
} from "@/lib/rssParser";
import { openLink } from "@/lib/utils";

interface RSSFeedListProps {
  feedUrl: string;
}

type Item = RSSItem;

const blurhash = "L|Ps0IwJxujtsUozW;Rj?^OXR*n%";

const handleOpen = async (url: string) => {
  if (!url) return;
  await openLink(url + "#inhalt"); // Append anchor to focus main content
};

function ListItem({ item }: { item: Item }) {
  const thumb = item.enclosures?.[0]?.url;
  const now = new Date();

  const publishedDate = item.published ? new Date(item.published) : null;
  const hasValidPublishedDate =
    !!publishedDate && !Number.isNaN(publishedDate.getTime());

  const date = hasValidPublishedDate
    ? publishedDate > now
      ? format(publishedDate, "EEEE, dd.MM.yyyy", { locale: de })
      : formatDistanceToNow(publishedDate, {
          addSuffix: true,
          locale: de,
        })
    : "—";

  const shadowColor = useThemeColor({}, "text");

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Beitrag öffnen: ${item.title}`}
      onPress={() => handleOpen(item.link || "")}
      hitSlop={8}
    >
      <ThemedView
        style={[styles.card, { shadowColor }]}
        lightColor="#fff"
        darkColor="#333"
      >
        {thumb && (
          <Image
            style={styles.thumb}
            source={thumb}
            placeholder={{ blurhash }}
            transition={1000}
          />
        )}
        <View style={styles.textContainer}>
          <ThemedText
            numberOfLines={3}
            style={styles.title}
            lightColor={dhbwRed}
            darkColor={dhbwRed}
          >
            {item.title}
          </ThemedText>
          <ThemedText style={styles.date} type="defaultSemiBold">
            {date}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

export default function RSSFeedList({ feedUrl }: RSSFeedListProps) {
  const ref = useRef<FlatList>(null);
  useScrollToTop(ref);
  const { isOnline, isOffline, isReady } = useOnlineStatus();
  const tintColor = useThemeColor({}, "tint");
  const backgroundColor = useThemeColor({}, "background");

  const queryKey = useMemo(() => ["rss", feedUrl], [feedUrl]);
  const { data, error, isLoading, isFetching, refetch } = useQuery<
    RSSFeed,
    Error
  >({
    queryKey,
    queryFn: () => fetchAndParseRSSFeed(feedUrl),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60 * 6, // 6 hours
    retry: 1,
  });

  const items = data?.items ?? [];

  // Auto-refresh when the device comes back online (while this screen is mounted)
  const prevOnlineRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!isReady) return;
    const prevOnline = prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    const cameBackOnline = prevOnline === false && isOnline === true;
    if (!cameBackOnline) return;

    void refetch();
  }, [isOnline, isReady, refetch]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={tintColor} />
      </ThemedView>
    );
  }

  // Offline + no data: show a dedicated empty state instead of a generic error.
  const showOffline = isReady && isOffline;
  const hasItems = items.length > 0;
  if (showOffline && !hasItems) {
    const onOpenSettings =
      Platform.OS === "web"
        ? undefined
        : () => {
            void Linking.openSettings();
          };
    return (
      <OfflineEmptyState onOpenSettings={onOpenSettings} onRetry={onRefresh} />
    );
  }

  // No data + error: show the existing retry UI.
  if (error && !hasItems) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>
          Fehler beim Laden des RSS-Feeds
        </ThemedText>
        <Pressable
          style={[styles.retryButton, { borderColor: tintColor }]}
          onPress={() => {
            void onRefresh();
          }}
        >
          <ThemedText style={[styles.retryText, { color: tintColor }]}>
            Erneut versuchen
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {showOffline && hasItems ? (
        <View style={styles.bannerWrap}>
          <OfflineBanner />
        </View>
      ) : null}
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ListItem item={item} />}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <ThemedText>Keine Einträge gefunden.</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const CARD_H = 120;
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  bannerWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  card: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 16,
    minHeight: CARD_H,
    elevation: 5,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  thumb: {
    width: CARD_H,
    minHeight: CARD_H,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  date: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
