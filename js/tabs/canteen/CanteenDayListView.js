// @flow
'use strict';

import React, { Component } from 'react';
import {
  Alert,
  View,
} from 'react-native';

import MealRow from './MealRow';

export default class CanteenDayListView extends Component {
  _showMealInfo(meal) {
    if(meal.addition && Array.isArray(meal.addition)){
      Alert.alert('Inhaltsstoffe', meal.addition.join('\n'));
    }
  }

  render() {
    const meal1 = {name: 'Schnitzel', addition: ['Dioxin','Chlor'],vegetarian: false, prices: [{price: '2€'},{price: '3€'},{price: '4€'}]};
    const meal2 = {name: 'Nudeln', vegetarian: true, prices: [{price: '1,50€'},{price: '1,90€'},{price: '2€'}]};
    const meal3 = {name: 'Salat', vegetarian: true, prices: [{price: '0,90€'},{price: '1,10€'},{price: '1,30€'}]};
    return (
      <View>
        <MealRow role={this.props.role} onPress={() => this._showMealInfo(meal1)} meal={meal1}/>
        <MealRow role={this.props.role} onPress={() => this._showMealInfo(meal2)} meal={meal2}/>
        <MealRow role={this.props.role} onPress={() => this._showMealInfo(meal3)} meal={meal3}/>
      </View>
    );
  }
}
