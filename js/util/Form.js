import React, { Component } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

export default class Form extends Component {
  // fields sind alle Felder, die über dem textfeld erscheinen sollen.
  // außerdem enthalten sie informationen, ob sie validiert werden sollen oder nebeneinander platziert werden sollen
  state = { fields: this.props.fields };

  validateAll(fields) {
    let hasProblems = false;
    Object.entries(fields).forEach(([k, e]) => {
      e.validated = true;
      if (this.validateInput(e)) hasProblems = true;
    });
    return hasProblems;
  }

  validateInput(field) {
    if (
      field.validated &&
      field.required &&
      (!field.value || field.value.trim() === '')
    ) {
      return (
        <Text style={styles.errText}>
          {field.name + ' '}darf nicht leer sein
        </Text>
      );
    }

    return null;
  }

  createForm = (fields) => {
    let res = [];
    let tmp = [];
    let lastItem = undefined;
    Object.entries(fields).forEach(([key, field], i) => {
      lastItem = field;

      let body = (
        <View key={i} style={{ flex: 1 }}>
          <Text>{field.name}:</Text>
          <TextInput
            style={styles.input}
            onChangeText={(input) => {
              const newField = field;
              newField.value = input;
              newField.validated = true;
              this.setState((this.state.fields[key] = newField));
            }}
            value={field.value}
          ></TextInput>
          {this.validateInput(field)}
        </View>
      );

      // wenn das nächste element nicht mit dem nachbar nebeneinander platziert werden soll,
      // dann füge alle vorherigen elemente zusammen, die nebeneinander platziert werden müssen
      if (tmp.length !== 0 && !field.isSplitted) {
        if (tmp.length === 1) {
          res.push(tmp[0]);
        } else {
          res.push(<View style={styles.row}>{tmp.slice()}</View>);
        }
        tmp = [];
      }
      // wenn das element nicht einen nachbar besitzen soll, dann füge das element in der view ein,
      // um das element alleine in der UI steht
      if (!field.isSplitted) {
        res.push(body);
        return;
      }
      // anonsten füg es zu den nachbarn ein, die nebeneinander platziert werden sollen
      else {
        tmp.push(body);
      }
    });

    // check last item if it should placed next to neighbour
    if (tmp.length != 0 && lastItem.isSplitted) {
      if (tmp.length === 1) {
        res.push(tmp[0]);
      } else {
        res.push(<View style={styles.row}>{tmp.slice()}</View>);
      }
      tmp = [];
    }

    return res;
  };

  render() {
    const fields = this.state.fields;
    return (
      <View style={styles.container}>
        <ScrollView persistentScrollbar={true}>
          {this.createForm(fields)}
        </ScrollView>
        {this.props.btnLabel ? (
          <Button
            color="red"
            style={{ margin: 6 }}
            title={this.props.btnLabel}
            onPress={() => {
              if (this.validateAll(this.state.fields)) {
                this.forceUpdate();
                return;
              }
              this.props.btnFunc(this.state.fields);
            }}
          ></Button>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    height: 35,
    margin: 3,
  },
  errText: {
    color: 'red',
    padding: 4,
  },
  container: {
    marginBottom: 4,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
});
