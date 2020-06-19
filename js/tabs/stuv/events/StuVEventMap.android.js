import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
  requireNativeComponent,
} from 'react-native';
import AndroidMap from '../../../util/AndroidMap';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function openGMaps(latitude, longitude) {
  Linking.openURL(
    'geo:' +
      latitude +
      ',' +
      longitude +
      '?q=' +
      latitude +
      ',' +
      longitude
  );
}

export default ({ latitude, longitude }) => (
  <View style={styles.mapContainer}>
    <AndroidMap
      location={{
        latitude: latitude,
        longitude: longitude,
      }}
      zoom={19}
      style={styles.map}
    />
    <MaterialCommunityIcons
      name={'google-maps'}
      size={32}
      style={styles.mapButton}
      onPress={() => openGMaps(latitude, longitude)}
    />
    <Text style={styles.copyrightText}>
      © OpenStreetMap contributors
    </Text>
  </View>
);

const styles = StyleSheet.create({
  copyrightText: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 10,
    margin: 3,
  },
  map: {
    flex: 1,
    zIndex: -1,
  },
  mapContainer: {
    height: 250,
  },
  mapButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 3,
  },
});
