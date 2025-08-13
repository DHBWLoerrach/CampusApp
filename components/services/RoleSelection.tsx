import { Pressable, StyleSheet, View, Platform } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { roles, type Role } from '@/constants/Roles';

function RadioItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.outerCircle,
          { borderColor: isDark ? '#AAA' : '#555' },
        ]}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isDark ? '#FFF' : '#000',
            }}
          />
        ) : null}
      </View>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </Pressable>
  );
}

export default function RoleSelection({
  role,
  onRoleChange,
}: {
  role: Role | null;
  onRoleChange: (role: Role) => void;
}) {
  return (
    <View style={styles.group}>
      {roles.map((r) => (
        <RadioItem
          key={r}
          label={r}
          selected={role === r}
          onPress={() => onRoleChange(r)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  outerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 16,
  },
});
