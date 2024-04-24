import { useContext } from 'react';
import { Text, TouchableOpacity } from 'react-native';

import Styles from '../../../Styles/StyleSheet';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { ColorSchemeContext } from '../../../context/ColorSchemeContext';

const iconSize = 30;

export default function SubmenuItem(props) {
  const colorContext = useContext(ColorSchemeContext);
  return (
    <TouchableOpacity
      style={[
        Styles.SubmenuItem.container,
        Styles.General.cardShadow,
        { backgroundColor: colorContext.colorScheme.card },
      ]}
      activeOpacity={0.7}
      onPress={props.onPress}
    >
      <FontAwesome6
        name={props.iconName}
        size={iconSize}
        style={Styles.SubmenuItem.icon}
        color={colorContext.colorScheme.icon}
        solid
      />
      <Text
        style={[
          Styles.SubmenuItem.label,
          { color: colorContext.colorScheme.text },
        ]}
      >
        {props.label}
      </Text>
    </TouchableOpacity>
  );
}
