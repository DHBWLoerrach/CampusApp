import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  shortString,
  unixTimeToDateText,
  unixTimeToTimeText,
} from '../helper';
import Colors from '../../../util/Colors';

export default function StuvEventCell({ event, onPress }) {
  const {
    name,
    description,
    images,
    date: { from, to },
  } = event;

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
    <TouchableOpacity
      style={styles.entry}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.container}>
        <Image source={image} style={styles.imageContainer} />

        <View style={styles.textContainer}>
          <Text style={styles.headline}>{name}</Text>

          <Text style={styles.details}>{formattedDate}</Text>
          <Text style={styles.details}>{formattedTime}</Text>
          <Text style={styles.details}>{registrationRequired}</Text>

          <Text style={styles.text}>
            {shortString(description, 120)}
          </Text>

          {/*<View style={{flex: 1, flexDirection: "row", backgroundColor: Colors.dhbwRed, borderRadius: 5, alignItems: "center", alignSelf: "center", padding: 15}}>
            <Text style={{fontSize: 15, color: 'white'}}>Mehr Details</Text>
          </View>*/}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  entry: {
    backgroundColor: Colors.veryLightGray,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
    shadowColor: 'black', // iOS and Android API-Level >= 28
    shadowOffset: {
      // effects iOS only!
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // effects iOS only!
    shadowRadius: 2.5, // effects iOS only!
    elevation: 4, // needed only for Android
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    resizeMode: 'contain',
  },
  textContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  headline: {
    fontSize: 28,
    color: Colors.dhbwRed,
    fontWeight: '700',
  },
  text: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 21,
    color: '#262626',
  },
  details: {
    marginTop: 8,
    fontSize: 18,
    color: '#262626',
    fontWeight: '600',
  },
  icon: {
    alignSelf: 'flex-end',
    color: 'white',
  },
});
