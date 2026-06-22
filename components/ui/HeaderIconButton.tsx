import { ComponentProps } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  type GestureResponderEvent,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

type HeaderIconButtonProps = {
  name: ComponentProps<typeof IconSymbol>['name'];
  color: ComponentProps<typeof IconSymbol>['color'];
  onPress: (event: GestureResponderEvent) => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  size?: number;
};

export default function HeaderIconButton({
  name,
  color,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  size = 20,
}: HeaderIconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={8}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <IconSymbol size={size} name={name} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
