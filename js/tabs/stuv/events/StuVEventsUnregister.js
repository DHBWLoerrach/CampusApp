import React, {useContext, useState} from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { unregisterUserEvent } from '../helper';
import Form from '../../../util/Form';
import PropertyDefinition from '../../../util/PropertyDefinition';
import Styles from '../../../Styles/StyleSheet';
import {ColorSchemeContext} from "../../../context/ColorSchemeContext";

export default function StuVEventsUnregister({ route }) {
  const navigation = useNavigation();
  const event = route.params.event;
  const [errText, setErrText] = useState(null);
  const colorContext = useContext(ColorSchemeContext);

  const fields = {
    email: new PropertyDefinition('Email').isRequired(),
  };

  return (
    <View style={[Styles.StuVEventsUnregister.container, {backgroundColor: colorContext.colorScheme.background}]}>
      <View style={Styles.StuVEventsUnregister.heading}>
        <Text style={[Styles.StuVEventsUnregister.text, {color: colorContext.colorScheme.text}]}>
          Abmeldung für das Event: {event.title}
        </Text>
        <Text style={{color: colorContext.colorScheme.text}}>
          Geben Sie Ihre Email ein. Sie bekommen eine Bestätigung per
          Email.
        </Text>
      </View>
      <Form
        btnLabel="Abmeldung senden"
        btnFunc={(field) =>
          unregisterUserEvent(field.email, event)
            .then((r) => navigation.goBack(null))
            .catch((err) =>
              setErrText(
                'Netzwerkfehler oder Email/Event existiert nicht oder ist nicht gültig'
              )
            )
        }
        fields={fields}
      ></Form>
      <Text style={Styles.StuVEventsUnregister.error}>{errText}</Text>
    </View>
  );
}
