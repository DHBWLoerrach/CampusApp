import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default ({ latitude, longitude, venue }) => (
  <View style={styles.container}>
    <MapView
      style={styles.map}
      region={{
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}
    >
      <Marker
        coordinate={{
          latitude: latitude,
          longitude: longitude,
        }}
        title={venue}
      />
    </MapView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: 400,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
