import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useScrollToTop } from '@react-navigation/native';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { dhbwRed } from '@/constants/Colors';
import { fetchAndParseRSSFeed, type RSSItem } from '@/lib/rssParser';
import { openLink } from '@/lib/utils';

interface RSSFeedListProps {
  feedUrl: string;
}

type Item = RSSItem;

const blurhash = 'L|Ps0IwJxujtsUozW;Rj?^OXR*n%';

const handleOpen = async (url: string) => {
  if (!url) return;
  await openLink(url + '#inhalt'); // Append anchor to focus main content
};

function ListItem({ item }: { item: Item }) {
  const thumb = item.enclosures?.[0]?.url;
  const publishedDate = new Date(item.published);
  const now = new Date();

  const date =
    publishedDate > now
      ? format(publishedDate, 'EEEE, dd.MM.yyyy', { locale: de })
      : formatDistanceToNow(publishedDate, {
          addSuffix: true,
          locale: de,
        });

  const shadowColor = useThemeColor({}, 'text');

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Beitrag öffnen: ${item.title}`}
      onPress={() => handleOpen(item.link || '')}
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
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const loadFeed = useCallback(async () => {
    try {
      setError(null);
      const parsed = await fetchAndParseRSSFeed(feedUrl);
      setItems(parsed.items);
    } catch (err) {
      setError('Fehler beim Laden des RSS-Feeds');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feedUrl]);

  useEffect(() => void loadFeed(), [feedUrl]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadFeed();
  }, [loadFeed]);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={tintColor} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable
          style={[styles.retryButton, { borderColor: tintColor }]}
          onPress={() => {
            setLoading(true);
            void loadFeed();
          }}
        >
          <ThemedText
            style={[styles.retryText, { color: tintColor }]}
          >
            Erneut versuchen
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ListItem item={item} />}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        }
      />
    </ThemedView>
  );
}

const CARD_H = 120;
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    height: CARD_H,
    elevation: 5,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  thumb: {
    width: CARD_H,
    height: CARD_H,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
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
    fontWeight: '600',
  },
});
