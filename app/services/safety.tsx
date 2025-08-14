import {
  Button,
  Platform,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { Colors, dhbwRed } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { useThemeColor } from '@/hooks/useThemeColor';
import { openLink } from '@/lib/utils';

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
  const pageBg = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Sicherheit',
          headerBackTitle: 'Services',
          ...bottomTabBarOptions,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.introText}>
          Ihre Sicherheit liegt uns am Herzen. Deshalb haben wir diese
          Videos zusammengestellt, in denen wir Sie über verschiedene
          Sicherheitshemen an der DHBW Lörrach informieren. Sie
          erfahren, wie Sie sich vor Unfällen schützen können und
          welche Sicherheitseinrichtungen es an den Standorten gibt.
          Viel Spaß!
        </ThemedText>
        <ThemedView style={styles.grid}>
          {links.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => openLink(item.url)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: pageBg,
                  opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
                },
              ]}
              android_ripple={{
                color: Colors.light.tint + '30',
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
          ))}
        </ThemedView>
        <ThemedView style={styles.buttonContainer}>
          <Button
            title="Brandschutzordnung (PDF)"
            color={dhbwRed}
            onPress={() =>
              openLink('https://dhbw-loerrach.de/brandschutz')
            }
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  introText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: '48%',
    borderRadius: 14,
    overflow: 'hidden',
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
