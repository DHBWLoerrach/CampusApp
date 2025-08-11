import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors, dhbwRed } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  IconSymbol,
  type IconSymbolName,
} from '@/components/ui/IconSymbol';
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

const moreLinks: {
  title: string;
  icon: IconSymbolName;
  url: string;
}[] = [
  {
    title: 'Studienkosten',
    icon: 'eurosign',
    url: 'https://www.dhbw.de/informationen/studieninteressierte#studienkosten-und-finanzierung',
  },
  {
    title: 'Finanzierung & Stipendien',
    icon: 'wallet.bifold',
    url: 'https://dhbw-loerrach.de/studierendenservice/studienfinanzierung#inhalt',
  },
  {
    title: 'IT-Services Wiki',
    icon: 'book.pages',
    url: 'https://go.dhbw-loerrach.de/its',
  },
  {
    title: 'Handbuch DHBW-IT',
    icon: 'doc.text.magnifyingglass',
    url: 'https://moodle.dhbw-loerrach.de/moodle/course/view.php?id=184',
  },
  {
    title: 'Wohnungen',
    icon: 'house',
    url: 'https://dhbw-loerrach.de/wohnungen#inhalt',
  },
  {
    title: 'Hochschulsport',
    icon: 'figure.run',
    url: 'https://dhbw-loerrach.de/hochschulsport#inhalt',
  },
  {
    title: 'Sprachen lernen',
    icon: 'translate',
    url: 'https://moodle.dhbw-loerrach.de/moodle/course/view.php?id=124',
  },
];

function LinkItem({
  item,
}: {
  item: { title: string; icon: IconSymbolName; url: string };
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      onPress={() => handleOpen(item.url)}
      style={({ pressed }) => [
        styles.itemContainer,
        {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
      android_ripple={{
        color: Colors[scheme ?? 'light'].tint + '30',
      }}
    >
      <IconSymbol
        name={item.icon}
        size={24}
        color={Colors[scheme ?? 'light'].icon}
        style={styles.icon}
      />
      <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
      <IconSymbol
        name="chevron.right"
        size={16}
        color={Colors[scheme ?? 'light'].icon}
        style={styles.chevron}
      />
    </Pressable>
  );
}

export default function MoreLinksScreen() {
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
          title: 'Studium: Weitere Links',
          headerBackTitle: 'Services',
          ...bottomTabBarOptions,
        }}
      />
      <FlatList
        data={moreLinks}
        renderItem={({ item }) => <LinkItem item={item} />}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.listContent}
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
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  icon: {
    marginRight: 16,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    marginLeft: 8,
  },
});
