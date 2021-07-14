import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../util/Colors';

class LectureItem extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let presence = this.props.lecture.presence
      ? 'bestanden'
      : 'nicht bestanden';

    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 20 }}>
          {this.props.lecture.name}
        </Text>
        <Text>Vorlesungsnummer: {this.props.lecture.number}</Text>
        <Text>Leistungsart: {this.props.lecture.examType}</Text>
        <Text>Note: {this.props.lecture.grade}</Text>
        <Text>Gewichtung: {this.props.lecture.weighting}</Text>
        <Text>Anwesenheitskontrolle: {presence}</Text>
      </View>
    );
  }
}

export default LectureItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    marginBottom: 10,
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
  },
});
