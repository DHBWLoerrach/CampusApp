import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import AndroidMap from '../../../util/AndroidMap';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Styles from '../../../Styles/StyleSheet';

function openGMaps(lat, long) {
  Linking.openURL(`geo:${lat},${long}?q=${lat},${long}`);
}

export default ({ latitude, longitude }) => (
  <View style={Styles.StuVEventMap.android.mapContainer}>
    <AndroidMap
      location={{ latitude, longitude }}
      zoom={19}
      style={Styles.StuVEventMap.android.map}
    />
    <MaterialCommunityIcons
      name="google-maps"
      size={32}
      style={Styles.StuVEventMap.android.mapButton}
      onPress={() => openGMaps(latitude, longitude)}
    />
    <Text style={Styles.StuVEventMap.android.copyrightText}>
      © OpenStreetMap contributors
    </Text>
  </View>
);