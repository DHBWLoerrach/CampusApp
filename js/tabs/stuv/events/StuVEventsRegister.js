import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { inviteUserEvent } from '../helper';
import Form from '../../../util/Form';
import PropertyDefinition from '../../../util/PropertyDefinition';
import Styles from '../../../Styles/StyleSheet';

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
    <View style={Styles.StuVEventsRegister.container}>
      <View style={Styles.StuVEventsRegister.heading}>
        <Text style={Styles.StuVEventsRegister.text}>
          {`Anmeldung für das Event: ${event.title}`}
        </Text>
        <Text style={Styles.StuVEventsRegister.text}>
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
      <Text style={Styles.StuVEventsRegister.error}>{errText}</Text>
    </View>
  );
}
