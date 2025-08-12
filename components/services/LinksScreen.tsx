import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ui/ThemedText';
import {
  IconSymbol,
  type IconSymbolName,
} from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { bottomTabBarOptions } from '@/constants/Navigation';
import { useColorScheme } from '@/hooks/useColorScheme';
import { openLink } from '@/lib/utils';

function LinkItem({
  item,
}: {
  item: { title: string; icon: IconSymbolName; url: string };
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      onPress={() => openLink(item.url)}
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

export default function LinksScreen({
  links,
  title,
}: {
  links: { title: string; icon: IconSymbolName; url: string }[];
  title: string;
}) {
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
          title: title,
          headerBackTitle: 'Services',
          ...bottomTabBarOptions,
        }}
      />
      <FlatList
        data={links}
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
