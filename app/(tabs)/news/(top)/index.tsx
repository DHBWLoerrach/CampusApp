import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { dhbwRed } from '@/constants/Colors';
import { parseRSSFeed, type RSSItem } from '@/lib/rssParser';

const FEED_URL = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

type Item = RSSItem;

function ListItem({ item }: { item: Item }) {
  const thumb = item.enclosures?.[0]?.url;
  const date = formatDistanceToNow(new Date(item.published), {
    addSuffix: true,
    locale: de,
  });
  const shadowColor = useThemeColor({}, 'text');

  return (
    <Link
      href={{
        pathname: '/(tabs)/news/[id]',
        params: { id: item.id },
      }}
      asChild
    >
      <Pressable>
        <ThemedView
          style={[styles.card, { shadowColor }]}
          lightColor="#fff"
          darkColor="#333"
        >
          {!!thumb && (
            <Image source={{ uri: thumb }} style={styles.thumb} />
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
    </Link>
  );
}

export default function NewsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const loadFeed = async () => {
    try {
      const xml = await fetch(FEED_URL).then((r) => r.text());
      const parsed = parseRSSFeed(xml);
      setItems(parsed.items);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => void loadFeed(), []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void loadFeed();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
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

const CARD_H = 110;
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
});
