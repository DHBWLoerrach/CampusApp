import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { inviteUserEvent } from '../helper';
import Form from '../../../util/Form';
import PropertyDefinition from '../../../util/PropertyDefinition';

export default function StuVEventsRegister({ route }) {
  const navigation = useNavigation();
  const event = route.params.event;
  const [errText, setErrText] = useState(null);

  const fields = {
    Email: new PropertyDefinition('Email').isRequired(),
    Vorname: new PropertyDefinition('Vorname')
      .isRequired()
      .splitWithNeighbour(),
    Nachname: new PropertyDefinition('Nachname')
      .isRequired()
      .splitWithNeighbour(),
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.text}>
          {`Anmeldung für das Event: ${event.title}`}
        </Text>
        <Text style={styles.text}>
          Bitte trage die folgenden Daten ein:
        </Text>
      </View>
      <Form
        btnLabel="Einladung senden"
        btnFunc={(fields) =>
          inviteUserEvent(
            fields['Email'].value,
            fields['Vorname'].value,
            fields['Nachname'].value,
            event
          )
            .then((r) => navigation.goBack(null))
            .catch((err) =>
              setErrText(
                'Netzwerkfehler oder Email/Event existiert nicht oder ist nicht gültig'
              )
            )
        }
        fields={fields}
      />
      <Text style={styles.error}>{errText}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  heading: {
    marginBottom: 10,
    marginTop: 4,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  error: {
    color: 'red',
    padding: 10,
    marginBottom: 8,
    fontSize: 17,
  },
});
