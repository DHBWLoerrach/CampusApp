import React, { Component } from 'react';
import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  View
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const Touchable =
  Platform.OS === 'ios' ? TouchableOpacity : TouchableNativeFeedback;

export default class HeaderIcon extends Component {
  render() {
    return (
      <Touchable
        onPress={this.props.onPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.icon}
      >
        <View>
          <MaterialIcon name={this.props.icon} size={24} color="white" />
        </View>
      </Touchable>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: 3
  }
});
