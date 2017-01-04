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
import ListCellTouchable from '../../util/ListCellTouchable';

export default class MealRow extends Component {
  render() {
    const { meal, role } = this.props;
    let vegetarian;
    if (meal.vegetarian) {
      vegetarian =
        <Image style={styles.vegetarian} source={require('./img/vegetarian.png')} />;
    }
    let price = meal.prices[0].price; // Student
    if(role === 'guest' || role === 'lecturer') { // Gäste oder Lehrbeauftragte
        price = meal.prices[2].price;
    } else if(role === 'employee') { // Mitarbeiter
      price = meal.prices[1].price;
    }
    return (
      <ListCellTouchable underlayColor={Colors.cellBorder}
        onPress={this.props.onPress}>
        <View style={styles.row}>
          <Text style={styles.name}>
            {meal.name}
          </Text>
          <View style={styles.right}>
            <Text style={styles.price}>{price}</Text>
            {vegetarian}
          </View>
        </View>
      </ListCellTouchable>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    flexDirection: 'row',
    borderColor: Colors.cellBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: {
    flex: 1,
    fontSize: 17,
  },
  price: {
    color: Colors.dhbwRed,
    fontSize: 17,
    paddingBottom: 4,
    textAlign: 'right',
    width: 50,
  },
  right: {
    alignItems: 'flex-end',
  },
  vegetarian: {
    backgroundColor: 'transparent',
    height: 28,
    width: 28,
  },
});
