import React, { useContext, useEffect } from 'react';
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
import NfcManager, { NfcTech } from 'react-native-nfc-manager';
import convertBytesToDouble from '../../util/Nfc_helper';

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
        <Text
          style={[
            Styles.CommonCell.headline,
            { flex: 1, lineHeight: 21.5 },
          ]}
        >
          {meal.name}
        </Text>
        <Text
          style={{
            color: colorContext.colorScheme.dhbwGray,
            alignSelf: 'flex-start',
            lineHeight: 21.5,
          }}
        >
          {price}
        </Text>
      </View>
      {Array.isArray(meal.addition) && (
        <Text style={[{ color: colorContext.colorScheme.text }]}>
          Inhaltsstoffe: {meal.addition.join(', ')}
        </Text>
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

  useEffect(() => {
    async function initNfc() {
      if (Platform.OS === 'ios' && (await NfcManager.isSupported())) {
        NfcManager.start();
      }
    }
    initNfc();
  }, []);

  const mealRows = meals.map((meal, index) => (
    <MealRow key={'meal' + index} meal={meal} role={role} />
  ));

  const textNfcInfo =
    '\n\nUm das Guthaben deines DHBW-Ausweises auszulesen, ' +
    'muss NFC aktiviert sein (sofern vom Handy unterstützt).\n' +
    'Schau dazu in den Einstellungen unter "Drahtlos & Netzwerke" nach.\n' +
    'Danach brauchst du einfach nur den Ausweis an die Rückseite deines Handys ' +
    'zu halten.';

  const onClickBalanceInfoAndroid = () => {
    Alert.alert('Guthaben auslesen', textNfcInfo);
  };

  const onClickBalanceInfoIOS = async () => {
    const isNfcAvailable =
      (await NfcManager.isSupported()) &&
      (await NfcManager.isEnabled());

    if (isNfcAvailable) {
      try {
        // Request access to the NFC technology
        await NfcManager.requestTechnology(NfcTech.MifareIOS, {
          alertMessage:
            'Halte nun deinen Studenten-Ausweis an den oberen Rand deines Handys.',
        });

        // now we can access data and files on the level of the selected application
        await NfcManager.sendMifareCommandIOS([
          0x5a, 0x5f, 0x84, 0x15,
        ]);
        // command to get value of value file: 0x6c, file 1 is requested (which is a value file)
        // the contents of this value file contains the current balance in 4 bytes
        const balanceBytes = await NfcManager.sendMifareCommandIOS([
          0x6c, 0x1,
        ]);
        // command to get file settings: 0xf5, file 1 is requested (which is a value file)
        const lastTransactionBytes =
          await NfcManager.sendMifareCommandIOS([0xf5, 0x1]);

        // convert bytes to double
        let { balance, lastTransaction } = convertBytesToDouble(
          balanceBytes,
          lastTransactionBytes
        );

        NfcManager.setAlertMessageIOS(
          'Guthaben: ' +
            balance +
            '€\nLetzte Transaktion: ' +
            lastTransaction +
            '€'
        );
      } catch (ex) {
        // handle error
        console.log('NFC error', ex);
      } finally {
        // Release the technology
        NfcManager.cancelTechnologyRequest();
      }
    } else {
      Alert.alert(
        'Guthaben-Info',
        'NFC scheint von deinem Gerät nicht unterstützt zu werden.'
      );
    }
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

      <View style={Styles.CanteenDayListView.buttonContainer}>
        <UIButton
          size="small"
          onClick={
            Platform.OS === 'android'
              ? onClickBalanceInfoAndroid
              : onClickBalanceInfoIOS
          }
        >
          Guthaben-Info
        </UIButton>
      </View>
    </View>
  );
}
