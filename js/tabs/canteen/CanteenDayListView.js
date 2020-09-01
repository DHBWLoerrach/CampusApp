import React, { Component } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import Colors from '../../util/Colors';
import { roles } from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';

class MealRow extends Component {
  render() {
    const { meal, role } = this.props;
    let vegetarian;
    if (meal.vegetarian) {
      vegetarian = (
        <Image
          style={styles.vegetarian}
          source={require('./img/vegetarian.png')}
        />
      );
    }
    let price = meal.prices[0].price; // Student
    if (role === roles[3] || role === roles[1]) {
      // Gäste oder Lehrbeauftragte
      price = meal.prices[2].price;
    } else if (role === roles[2]) {
      // Mitarbeiter
      price = meal.prices[1].price;
    }
    return (
      <ListCellTouchable
        underlayColor={Colors.cellBorder}
        onPress={this.props.onPress}
      >
        <View style={styles.row}>
          <Text style={styles.name}>{meal.name}</Text>
          <View style={styles.right}>
            <Text style={styles.price}>{price}</Text>
            {vegetarian}
          </View>
        </View>
      </ListCellTouchable>
    );
  }
}

export default class CanteenDayListView extends Component {
  _showMealInfo(meal) {
    if (meal.addition && Array.isArray(meal.addition)) {
      Alert.alert('Inhaltsstoffe', meal.addition.join('\n'));
    }
  }

  render() {
    const { meals, role } = this.props;
    const mealRows = meals.map((meal, index) => (
      <MealRow
        key={'meal' + index}
        meal={meal}
        role={role}
        onPress={() => this._showMealInfo(meal)}
      />
    ));
    return <View>{mealRows}</View>;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
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
