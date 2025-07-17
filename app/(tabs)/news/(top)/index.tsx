import { Link } from 'expo-router';
import {
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';

export default function NewsListScreen() {
  const newsItems = [
    {
      id: '1',
      title: 'Neuigkeiten aus der CampusApp',
      summary:
        'Erfahren Sie mehr über die neuesten Funktionen und Updates der CampusApp.',
      publishedAt: '2023-10-01T12:00:00Z',
    },
    {
      id: '2',
      title: 'Campus Veranstaltungen im Oktober',
      summary:
        'Alle wichtigen Termine und Veranstaltungen auf dem Campus im Oktober.',
      publishedAt: '2023-10-02T08:00:00Z',
    },
  ]; // Deine RSS-Feed Daten

  return (
    <FlatList
      data={newsItems}
      renderItem={({ item }) => (
        <Link href={`/news/${item.id}`} asChild>
          <Pressable style={styles.newsItem}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
              <Text style={styles.date}>
                {new Date(item.publishedAt).toLocaleDateString(
                  'de-DE'
                )}
              </Text>
            </View>
          </Pressable>
        </Link>
      )}
      keyExtractor={(item) => item.id}
    />
  );
}

const styles = StyleSheet.create({
  newsItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
