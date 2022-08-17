import React, {useContext} from 'react';
import { Alert, Image, Text, View } from 'react-native';

import { roles } from '../../util/Constants';
import ListCellTouchable from '../../util/ListCellTouchable';
import Styles from '../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../context/ColorSchemeContext";

function MealRow({ meal, role, onPress }) {
  let vegetarian;
  const colorContext = useContext(ColorSchemeContext);
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
      underlayColor={colorContext.colorScheme.cellBorder}
      onPress={onPress}
    >
      <View style={[Styles.CanteenDayListView.row, {backgroundColor: colorContext.colorScheme.background, borderColor: colorContext.colorScheme.cellBorder}]}>
        <Text style={[Styles.CanteenDayListView.name, {color: colorContext.colorScheme.text}]}>{meal.name}</Text>
        <View style={Styles.CanteenDayListView.right}>
          <Text style={[Styles.CanteenDayListView.price, {color: colorContext.colorScheme.dhbwRed}]}>{price}</Text>
          {vegetarian}
        </View>
      </View>
    </ListCellTouchable>
  );
}

export default function CanteenDayListView({ meals, role }) {
  const colorContext = useContext(ColorSchemeContext);
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
  return <View style={{backgroundColor: colorContext.colorScheme.background}}>{mealRows}</View>;
}
