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
import { useThemeColor } from '@/hooks/useThemeColor';
import { openLink } from '@/lib/utils';

function LinkItem({
  item,
}: {
  item: { title: string; icon: IconSymbolName; url: string };
}) {
  const schemeBg = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  return (
    <Pressable
      onPress={() => openLink(item.url)}
      style={({ pressed }) => [
        styles.itemContainer,
        {
          backgroundColor: schemeBg,
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
      android_ripple={{
        color: Colors.light.tint + '30',
      }}
    >
      <IconSymbol
        name={item.icon}
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
      <IconSymbol
        name="chevron.right"
        size={16}
        color={iconColor}
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
  const pageBg = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor: pageBg }]}>
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
