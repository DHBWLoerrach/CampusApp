import React, { Component } from 'react';
import {
  Alert,
  Platform,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import Colors from '../../util/Colors';
import ListCellTouchable from '../../util/ListCellTouchable';

export default function LinksList({ navigation, route }) {
  const content = route.params?.links.map((link, index) => (
    <Row link={link} key={index} navigate={navigation.navigate} />
  ));
  return (
    <View style={styles.container}>
      <ItemsWithSeparator>{content}</ItemsWithSeparator>
    </View>
  );
}

function ItemsWithSeparator(props) {
  const children = [];
  const length = React.Children.count(props.children);
  React.Children.forEach(props.children, (child, ii) => {
    children.push(child);
    if (ii !== length - 1) {
      children.push(
        <View key={'separator-' + ii} style={styles.separator} />
      );
    }
  });
  return <View>{children}</View>;
}

class Row extends Component {
  render() {
    const { title, url, tel, onPress, screen } = this.props.link;

    let icon = null;
    if (tel) {
      icon = <MaterialIcon name="phone" size={16} />;
    }
    if (url) {
      icon = <FontAwesome name="external-link" size={16} />;
    }
    if (onPress || screen) {
      icon = <MaterialIcon name="chevron-right" size={24} />;
    }

    return (
      <ListCellTouchable
        underlayColor={Colors.cellBorder}
        onPress={this._handlePress.bind(this)}
      >
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {icon}
        </View>
      </ListCellTouchable>
    );
  }

  _handlePress() {
    this._handleOnPress();
    this._handleUrlPress();
    this._handleScreenPress();
    this._handleTelPress();
  }

  _handleOnPress() {
    const { onPress } = this.props.link;
    if (onPress) onPress();
  }

  _handleUrlPress() {
    const { url } = this.props.link;
    if (url) Linking.openURL(url);
  }

  _handleScreenPress() {
    const { screen, text } = this.props.link;
    if (screen) this.props.navigate(screen, { text });
  }

  _handleTelPress() {
    const { tel } = this.props.link;
    if (tel) {
      const telLink = 'tel:' + tel;
      if (Platform.OS === 'ios') {
        Alert.alert('Nummer wählen?', tel, [
          { text: 'Nein' },
          { text: 'Ja', onPress: () => this._openTelLink(telLink) },
        ]);
      } else {
        this._openTelLink(telLink);
      }
    }
  }

  _openTelLink(telLink) {
    Linking.openURL(telLink);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  separator: {
    backgroundColor: Colors.cellBorder,
    height: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  title: {
    flex: 1,
    fontSize: 17,
    color: Colors.darkText,
  },
});
