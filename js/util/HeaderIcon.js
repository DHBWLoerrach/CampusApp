import {
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Styles from '../Styles/StyleSheet';

const Touchable =
  Platform.OS === 'ios' ? TouchableOpacity : TouchableNativeFeedback;

export default function HeaderIcon({ icon, size, onPress }) {
  return (
    <Touchable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={Styles.HeaderIcon.touchable}
    >
      <View>
        <FontAwesome6
          style={Styles.HeaderIcon.icon}
          name={icon}
          size={size || 24}
          color="white"
        />
      </View>
    </Touchable>
  );
}
