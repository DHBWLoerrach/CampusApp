import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../util/Colors';

export default function LectureItem({
  lecture: { name, number, examType, presence, weighting, grade },
}) {
  let thePresence = presence ? 'bestanden' : 'nicht bestanden';

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text>Vorlesungsnummer: {number}</Text>
      <Text>Leistungsart: {examType}</Text>
      <Text>Note: {grade}</Text>
      <Text>Gewichtung: {weighting}</Text>
      <Text>Anwesenheitskontrolle: {thePresence}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    marginBottom: 10,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
  name: {
    fontSize: 20,
  },
});
