import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
  Image,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, dhbwRed } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { ThemedText } from '@/components/ui/ThemedText';
import * as WebBrowser from 'expo-web-browser';
import { Stack } from 'expo-router';

const handleOpen = async (url: string) => {
  if (!url) return;

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle:
        WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, //iOS
      controlsColor: dhbwRed, // iOS
      createTask: false, // Android
      showTitle: false, // Android
    });
  }
};

const links: {
  title: string;
  url: string;
  img: any;
}[] = [
  {
    title: 'Herzlich Willkommen',
    url: 'https://video.dhbw.de/videos/video-1_9se923y8gn/',
    img: require('@/assets/images/app/security/1.jpg'),
  },
  {
    title: 'Sicherheit an der DHBW Lörrach',
    url: 'https://video.dhbw.de/videos/video-2_3jlqt4t17l/',
    img: require('@/assets/images/app/security/2.jpg'),
  },
  {
    title: 'Notfalleinrichtungen',
    url: 'https://video.dhbw.de/videos/video-3_m885vwgf9y/',
    img: require('@/assets/images/app/security/3.jpg'),
  },
  {
    title: 'Arbeits- und Wegeunfälle',
    url: 'https://video.dhbw.de/videos/video-4_9kjeusngm4/',
    img: require('@/assets/images/app/security/4.jpg'),
  },
  {
    title: 'Brandschutz',
    url: 'https://video.dhbw.de/videos/video-5_befqkvvxdz/',
    img: require('@/assets/images/app/security/5.jpg'),
  },
];

export default function SafetyScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000000' : '#F2F2F7' },
      ]}
    >
      <Stack.Screen
        options={{
          title: 'Sicherheit',
          headerBackTitle: 'Services',
          ...bottomTabBarOptions,
        }}
      />
      <FlatList
        data={links}
        keyExtractor={(item) => item.title}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <ThemedText style={styles.introText}>
            Ihre Sicherheit liegt uns am Herzen. Deshalb haben wir
            diese Videos zusammengestellt, in denen wir Sie über
            verschiedene Sicherheitshemen an der DHBW Lörrach
            informieren. Sie erfahren, wie Sie sich vor Unfällen
            schützen können und welche Sicherheitseinrichtungen es an
            den Standorten gibt. Viel Spaß!
          </ThemedText>
        )}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => handleOpen(item.url)}
            style={({ pressed }) => [
              styles.card,
              index % 2 === 0 && styles.cardLeft,
              {
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
              },
            ]}
            android_ripple={{
              color: Colors[scheme ?? 'light'].tint + '30',
            }}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} Video`}
            accessibilityHint="Öffnet das Video in einem Browser"
          >
            <Image
              source={item.img}
              style={styles.image}
              resizeMode="cover"
              accessible
              accessibilityLabel={item.title}
            />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    marginBottom: 12,
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    height: 130,
    justifyContent: 'flex-end',
    marginLeft: 12,
  },
  cardLeft: { marginLeft: 0 },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
