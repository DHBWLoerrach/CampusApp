import { Text } from 'react-native';

type Props = {
  focused: boolean;
  children: string | number;
  color?: string;
};

export default function TopTabLabel({ focused, children, color }: Props) {
  return (
    <Text
      numberOfLines={1}
      style={{
        color: color ?? '#5C6971',
        opacity: focused ? 1 : 0.82,
        fontSize: 14,
        fontWeight: focused ? '700' : '500',
      }}
    >
      {children}
    </Text>
  );
}
