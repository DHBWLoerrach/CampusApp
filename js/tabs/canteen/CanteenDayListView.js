import React, { useContext } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { roles } from '../../util/Constants';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import UIButton from '../../ui/UIButton';

function MealRow({ meal, role }) {
  const colorContext = useContext(ColorSchemeContext);
  let price = meal.prices[0].price; // Student
  if (role === roles[3] || role === roles[1]) {
    // Gäste oder Lehrbeauftragte
    price = meal.prices[2].price;
  } else if (role === roles[2]) {
    // Mitarbeiter
    price = meal.prices[1].price;
  }

  return (
    <View
      style={[
        Styles.General.cardShadow,
        Styles.CommonCell.entry,
        { backgroundColor: colorContext.colorScheme.card },
      ]}
    >
      <View style={Styles.CanteenDayListView.cardElementHeader}>
        <Text style={[Styles.CommonCell.headline, { flex: 1 }]}>
          {meal.name}
        </Text>
        <Text style={{ color: colorContext.colorScheme.dhbwGray }}>
          {price}
        </Text>
      </View>
      {Array.isArray(meal.addition) && (
        <View
          style={[
            Styles.CanteenDayListView.cardVegetarianBox,
            { backgroundColor: colorContext.colorScheme.dhbwGray },
          ]}
        >
          <Text style={[{ color: '#fff' }]}>
            Inhaltsstoffe: {meal.addition.join(', ')}
          </Text>
        </View>
      )}
      {meal.vegetarian && (
        <View
          style={[
            Styles.CanteenDayListView.cardVegetarianBox,
            { backgroundColor: colorContext.colorScheme.dhbwGray },
          ]}
        >
          <Text style={{ color: '#fff' }}>Vegetarisch</Text>
        </View>
      )}
    </View>
  );
}

export default function CanteenDayListView({ meals, role }) {
  const colorContext = useContext(ColorSchemeContext);

  const mealRows = meals.map((meal, index) => (
    <MealRow key={'meal' + index} meal={meal} role={role} />
  ));

  const textNfcInfo =
    '\n\nUm das Guthaben Deines DHBW-Ausweises auszulesen, ' +
    'muss NFC aktiviert sein (sofern vom Handy unterstützt).\n' +
    'Schau dazu in den Einstellungen unter "Drahtlos & Netzwerke" nach.\n' +
    'Danach brauchst Du einfach nur den Ausweis an die Rückseite Deines Handys ' +
    'zu halten.';

  const onClickBalanceInfo = () => {
    Alert.alert('Guthaben auslesen', textNfcInfo);
  };

  return (
    <View
      style={[
        { backgroundColor: colorContext.colorScheme.background },
        Styles.CanteenDayListView.menuContainer,
      ]}
    >
      <ScrollView style={Styles.CanteenDayListView.listOfCards}>
        {mealRows}
      </ScrollView>
      {Platform.OS === 'android' && (
        <View style={Styles.CanteenDayListView.buttonContainer}>
          <UIButton size="small" onClick={onClickBalanceInfo}>
            Guthaben-Info
          </UIButton>
        </View>
      )}
    </View>
  );
}
