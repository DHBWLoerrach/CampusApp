// @flow
'use strict';

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Colors from '../../util/Colors';
import Constants from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';

import type { NewsItem } from '../../util/types';

export default class NewsCell extends Component {
  props: {
    news: NewsItem;
  };

  render() {
    const image = require("./img/news-announcement.png");
    return(
      <ListCellTouchable underlayColor={Colors.cellBorder}
        onPress={this.props.onPress}>
        <View style={styles.row}>
          <Image source={image} style={styles.image}/>
          <View style={styles.newsheadings}>
            <Text style={styles.heading}>{this.props.news.heading}</Text>
            <Text style={styles.subheading}>{this.props.news.subheading}</Text>
          </View>
        </View>
      </ListCellTouchable>
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
  newsheadings: {
    flex: 1,
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
