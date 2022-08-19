import React, {useContext} from 'react';
import {
  Image,
  Text,
  View,
  Button
} from 'react-native';
import {
  shortString,
  unixTimeToDateText,
  unixTimeToTimeText,
} from '../helper';
import Colors from '../../../Styles/Colors';
import Styles from '../../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";

export default function StuvEventCell({ event, onPress }) {
  const {
    name,
    description,
    images,
    date: { from, to },
  } = event;

  const colorContext = useContext(ColorSchemeContext);

  const formattedDate = unixTimeToDateText(from);
  const formattedTime = to
    ? `${unixTimeToTimeText(from)} bis ${unixTimeToTimeText(to)} Uhr`
    : `${unixTimeToTimeText(from)} Uhr`;

  const registrationRequired =
    'Anmeldung: ' + (event.registration.required ? 'Ja' : 'Nein');

  const image = images.overview
    ? { uri: images.overview.src }
    : require('../../../img/crowd.png');

  return (
    <View style={[Styles.General.cardShadow, Styles.StuVEventCell.entry]}>
      <View style={[{backgroundColor: colorContext.colorScheme.card}, Styles.StuVEventCell.container]}>
        <Image source={image} style={Styles.StuVEventCell.imageContainer} />

        <View style={Styles.StuVEventCell.textContainer}>
          <Text style={Styles.StuVEventCell.headline}>{name}</Text>

          <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventCell.details]}>{formattedDate}</Text>
          <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventCell.details]}>{formattedTime}</Text>
          <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventCell.details]}>{registrationRequired}</Text>

          <Text style={[{color: colorContext.colorScheme.text}, Styles.StuVEventCell.text]}>
            {shortString(description, 120)}
          </Text>

          <View style={{marginTop: 8, alignSelf: "center", borderRadius: 5}}>
            <Button color={Colors.dhbwRed} title="Weitere Infos" onPress={onPress}/>
            {/*<View style={{flex: 1, flexDirection: "row", backgroundColor: Colors.dhbwRed, borderRadius: 5, alignItems: "center", alignSelf: "center", padding: 15}}>
              <Text style={{fontSize: 15, color: 'white'}}>Mehr Details</Text>
            </View>*/}
          </View>
        </View>
      </View>
    </View>
  );
}
