// Fallback for using MaterialIcons and MaterialCommunityIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';
import {
  OpaqueColorValue,
  type StyleProp,
  type TextStyle,
} from 'react-native';

type IconSource = 'material' | 'community';

type IconConfig = {
  name:
    | ComponentProps<typeof MaterialIcons>['name']
    | ComponentProps<typeof MaterialCommunityIcons>['name'];
  source: IconSource;
};

export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 * - Use 'material' for MaterialIcons, 'community' for MaterialCommunityIcons
 */
const MAPPING = {
  house: { name: 'home', source: 'material' },
  calendar: { name: 'calendar-month', source: 'material' },
  'fork.knife': { name: 'restaurant', source: 'material' },
  'info.circle': { name: 'info-outline', source: 'material' },
  map: { name: 'map', source: 'material' },
  phone: { name: 'call', source: 'material' },
  graduationcap: { name: 'school', source: 'material' },
  'sun.max': { name: 'wb-sunny', source: 'material' },
  envelope: { name: 'mail-outline', source: 'material' },
  gearshape: { name: 'settings', source: 'material' },
  'info.square': { name: 'perm-device-info', source: 'material' },
  'exclamationmark.triangle': {
    name: 'warning-amber',
    source: 'material',
  },
  magnifyingglass: { name: 'search', source: 'material' },
  'chart.bar': { name: 'insert-chart-outlined', source: 'material' },
  'person.3': { name: 'groups', source: 'material' },
  'text.page': { name: 'description', source: 'material' },
  translate: { name: 'translate', source: 'material' },
  eye: { name: 'visibility', source: 'material' },
  'chevron.right': { name: 'chevron-right', source: 'material' },
  'chevron.left': { name: 'chevron-left', source: 'material' },
  'chevron.down': { name: 'expand-more', source: 'material' },
  'rectangle.stack': { name: 'layers', source: 'material' },
  'figure.run': { name: 'directions-run', source: 'material' },
  eurosign: { name: 'euro-symbol', source: 'material' },
  'wallet.bifold': {
    name: 'wallet',
    source: 'material',
  },
  'book.pages': { name: 'menu-book', source: 'material' },
  'checkmark.circle': {
    name: 'check-circle-outline',
    source: 'material',
  },
  'doc.text.magnifyingglass': { name: 'article', source: 'material' },
  clock: { name: 'schedule', source: 'material' },
  video: { name: 'videocam', source: 'material' },
  'door.left.hand.open': { name: 'door-open', source: 'community' },
  link: { name: 'link-variant', source: 'community' },
  'envelope.open': {
    name: 'email-open-outline',
    source: 'community',
  },
  car: { name: 'directions-car', source: 'material' },
  'car.fill': { name: 'directions-car', source: 'material' },
  binoculars: { name: 'binoculars', source: 'community' },
  'mappin.and.ellipse': {
    name: 'map-marker-radius',
    source: 'community',
  },
  'books.vertical': { name: 'bookshelf', source: 'community' },
  shield: { name: 'shield-outline', source: 'community' },
  'shield.lefthalf.filled': {
    name: 'shield-half-full',
    source: 'community',
  },
  building: { name: 'office-building', source: 'community' },
  'person.2.wave.2': {
    name: 'human-greeting-proximity',
    source: 'community',
  },
  'xmark.circle.fill': { name: 'close', source: 'community' },
  'person.crop.circle.badge.questionmark': {
    name: 'account-question',
    source: 'community',
  },
} as Record<string, IconConfig>;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 * Falls back to MaterialCommunityIcons if the icon is not available in MaterialIcons.
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
  // Keep signature compatible with iOS variant which supports `weight`
  weight?: any;
}) {
  const iconConfig = MAPPING[name];

  if (iconConfig.source === 'community') {
    return (
      <MaterialCommunityIcons
        color={color}
        size={size}
        name={
          iconConfig.name as ComponentProps<
            typeof MaterialCommunityIcons
          >['name']
        }
        style={style}
      />
    );
  }

  return (
    <MaterialIcons
      color={color}
      size={size}
      name={
        iconConfig.name as ComponentProps<
          typeof MaterialIcons
        >['name']
      }
      style={style}
    />
  );
}
