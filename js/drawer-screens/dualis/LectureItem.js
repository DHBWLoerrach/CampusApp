import React from 'react';
import { View, Text } from 'react-native';
import Styles from '../../Styles/StyleSheet';

export default function LectureItem({
  lecture: { name, number, examType, presence, weighting, grade },
}) {
  let thePresence = presence ? 'bestanden' : 'nicht bestanden';

  return (
    <View style={Styles.LectureItem.container}>
      <Text style={Styles.LectureItem.name}>{name}</Text>
      <Text>Vorlesungsnummer: {number}</Text>
      <Text>Leistungsart: {examType}</Text>
      <Text>Note: {grade}</Text>
      <Text>Gewichtung: {weighting}</Text>
      <Text>Anwesenheitskontrolle: {thePresence}</Text>
    </View>
  );
}
