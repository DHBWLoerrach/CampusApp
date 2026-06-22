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
        color: color ?? 'white',
        opacity: focused ? 1 : 0.7,
        fontSize: 14,
      }}
    >
      {children}
    </Text>
  );
}
