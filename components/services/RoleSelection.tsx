import { Pressable, StyleSheet, View, Platform } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
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
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: background,
          opacity: Platform.OS === 'ios' && pressed ? 0.7 : 1,
        },
      ]}
    >
      {/* Decorative radio circle; the state is exposed via accessibilityState */}
      <View
        style={[styles.outerCircle, { borderColor: border }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: text,
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
    <View
      style={styles.group}
      accessibilityRole="radiogroup"
      accessibilityLabel="Mensa-Preisgruppe"
    >
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
