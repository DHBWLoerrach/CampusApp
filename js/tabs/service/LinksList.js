// @flow
'use strict';

import React, { Component } from 'react';
import {
  Alert,
  Platform,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '../../util/Colors';
import ListCellTouchable from '../../util/ListCellTouchable';

export default class LinksList extends Component {
  props: {
    title: string;
    links: Array<{
      title: string;
      url?: string;
      onPress?: () => void;
    }>;
  };

  render() {
    const content = this.props.links.map(
      (link, index) => <Row link={link} key={index} />
    );
    return (
      <View>
        <ItemsWithSeparator>{content}</ItemsWithSeparator>
      </View>
    );
  }
}

class ItemsWithSeparator extends Component {
  props: {
    children: any;
  };

  render() {
    const children = [];
    const length = React.Children.count(this.props.children);
    React.Children.forEach(
      this.props.children,
      (child, ii) => {
        children.push(child);
        if(ii !== length - 1) {
          children.push(
            <View
              key={'separator-' + ii}
              style={styles.separator}
            />
          );
        }
      }
    );
    return <View>{children}</View>;
  }
}

class Row extends Component {
  props: {
    link: {
      title: string;
      url?: string;
      tel?: string;
      onPress?: () => void;
    };
  };

  render() {
    const {title, url, tel} = this.props.link;
    return (
      <ListCellTouchable
        underlayColor={Colors.cellBorder}
        onPress={this._handlePress.bind(this)}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Image source={this.props.link.url ?
            require('./img/chevron-right.png')
            : this.props.link.tel ? require('./img/phone.png'): null}
          />
        </View>
      </ListCellTouchable>
    );
  }

  _handlePress() {
    this._handleOnPress();
    this._handleUrlPress();
    this._handleTelPress();
  }

  _handleOnPress() {
    const { onPress } = this.props.link;
    if(onPress) onPress();
  }

  _handleUrlPress() {
    const { url } = this.props.link;
    if(url) Linking.openURL(url);
  }

  _handleTelPress() {
    const { tel } = this.props.link;
    if(tel) {
      const telLink = 'tel:' + tel;
      if(Platform.OS === 'ios') {
        Alert.alert('Nummer wählen?', tel,
          [{text: 'Nein'},{text: 'Ja', onPress: () => this._openTelLink(telLink)}]);
      }
      else {
        this._openTelLink(telLink);
      }
    }
  }

  _openTelLink(telLink) {
    Linking.openURL(telLink);
  }
}

const styles = StyleSheet.create({
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
