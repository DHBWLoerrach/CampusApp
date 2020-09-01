import React, { Component } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import Colors from '../../util/Colors';
import { roles } from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';

function MealRow({ meal, role, onPress }) {
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
      onPress={onPress}
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

export default function CanteenDayListView({ meals, role }) {
  function _showMealInfo(meal) {
    if (meal.addition && Array.isArray(meal.addition)) {
      Alert.alert('Inhaltsstoffe', meal.addition.join('\n'));
    }
  }

  const mealRows = meals.map((meal, index) => (
    <MealRow
      key={'meal' + index}
      meal={meal}
      role={role}
      onPress={() => _showMealInfo(meal)}
    />
  ));
  return <View>{mealRows}</View>;
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
