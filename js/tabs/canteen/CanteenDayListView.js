import React from 'react';
import { Alert, Image, Text, View } from 'react-native';

import Colors from '../../util/Colors';
import { roles } from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';
import Styles from '../../Styles/StyleSheet';

function MealRow({ meal, role, onPress }) {
  let vegetarian;
  if (meal.vegetarian) {
    vegetarian = (
      <Image
        style={Styles.CanteenDayListView.vegetarian}
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
      <View style={Styles.CanteenDayListView.row}>
        <Text style={Styles.CanteenDayListView.name}>{meal.name}</Text>
        <View style={Styles.CanteenDayListView.right}>
          <Text style={Styles.CanteenDayListView.price}>{price}</Text>
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