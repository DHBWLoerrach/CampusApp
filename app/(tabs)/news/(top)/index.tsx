import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import RSSParser from 'react-native-rss-parser';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { dhbwRed } from '@/constants/Colors';

const FEED_URL = 'https://dhbw-loerrach.de/rss-campus-app-aktuell';

type Item = {
  id: string;
  title: string;
  published: string;
  enclosures?: { url: string }[];
};

export default function NewsList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = async () => {
    try {
      const xml = await fetch(FEED_URL).then((r) => r.text());
      const parsed = await RSSParser.parse(xml);
      setItems(parsed.items as Item[]);
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

  const renderItem = ({ item }: { item: Item }) => {
    const thumb = item.enclosures?.[0]?.url;
    const date = formatDistanceToNow(new Date(item.published), {
      addSuffix: true,
      locale: de,
    });

    return (
      <Link
        href={{
          pathname: '/(tabs)/news/[id]',
          params: { id: item.id },
        }}
        asChild
      >
        <Pressable style={styles.card}>
          {!!thumb && (
            <Image source={{ uri: thumb }} style={styles.thumb} />
          )}
          <View style={styles.text}>
            <Text numberOfLines={3} style={styles.title}>
              {item.title}
            </Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
  );
}

const CARD_H = 110;
const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.05,
  },
  thumb: {
    width: CARD_H,
    height: CARD_H,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  text: { flex: 1, padding: 12 },
  title: { fontSize: 18, fontWeight: '700', color: dhbwRed },
  date: { marginTop: 4, fontSize: 14, color: '#555' },
});
