import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Styles from '../../../Styles/StyleSheet';

export default ({ latitude, longitude, venue }) => (
  <View style={Styles.StuVEventMap.ios.container}>
    <MapView
      style={Styles.StuVEventMap.ios.map}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }}
    >
      <Marker coordinate={{ latitude, longitude }} title={venue} />
    </MapView>
  </View>
);
