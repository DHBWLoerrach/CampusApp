import React, {useContext, useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { inviteUserEvent } from '../helper';
import Form from '../../../util/Form';
import PropertyDefinition from '../../../util/PropertyDefinition';
import Styles from '../../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";

export default function StuVEventsRegister({ route }) {
  const navigation = useNavigation();
  const event = route.params.event;
  const [errText, setErrText] = useState(null);
  const colorContext = useContext(ColorSchemeContext);

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
    <View style={[Styles.StuVEventsRegister.container, {backgroundColor: colorContext.colorScheme.background}]}>
      <View style={Styles.StuVEventsRegister.heading}>
        <Text style={[Styles.StuVEventsRegister.text, {color: colorContext.colorScheme.text}]}>
          {`Anmeldung für das Event: ${event.title}`}
        </Text>
        <Text style={[Styles.StuVEventsRegister.text, {color: colorContext.colorScheme.text}]}>
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
