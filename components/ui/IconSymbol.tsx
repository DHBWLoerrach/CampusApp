// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import {
  OpaqueColorValue,
  type StyleProp,
  type TextStyle,
} from 'react-native';

type IconMapping = Record<
  SymbolViewProps['name'],
  ComponentProps<typeof MaterialIcons>['name']
>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  house: 'home',
  calendar: 'calendar-month',
  'fork.knife': 'restaurant',
  'info.circle': 'info-outline',
  location: 'pin-drop',
  binoculars: '360',
  map: 'map',
  shield: 'security',
  'building.columns': 'home-work',
  link: 'link',
  phone: 'call',
  graduationcap: 'school',
  'books.vertical': 'menu-book',
  building: 'warehouse',
  'sun.max': 'wb-sunny',
  envelope: 'mail-outline',
  gearshape: 'settings',
  'info.square': 'perm-device-info',
  'exclamationmark.triangle': 'warning-amber',
  'text.page': 'description',
  eye: 'visibility',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
