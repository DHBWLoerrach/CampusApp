// @flow
'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';

export default class NewsCell extends Component {
  render() {
    const image = require("./img/news-announcement.png");
    return(
      // TODO: Heading overflows to the right ...
      <TouchableHighlight underlayColor={Colors.cellBorder}
        onPress={()=>alert('Show news details')}>
        <View style={styles.row}>
          <Image source={image} style={styles.image}/>
          <View>
            <Text style={styles.heading}>{this.props.news.heading}</Text>
            <Text style={styles.subheading}>{this.props.news.subheading}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: Constants.listViewRowPaddingVertical,
    paddingHorizontal: Constants.listViewRowPaddingHorizontal,
  },
  image: {
    marginRight: 15,
  },
  heading: {
    fontSize: Constants.bigFont,
    fontWeight: 'bold',
    color: Colors.dhbwRed,
  },
  subheading: {
    fontSize: Constants.smallFont,
  },
});
