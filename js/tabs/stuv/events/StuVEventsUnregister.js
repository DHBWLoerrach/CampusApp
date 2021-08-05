import React, { useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { unregisterUserEvent } from '../helper';
import Form from '../../../util/Form';
import PropertyDefinition from '../../../util/PropertyDefinition';

export default function StuVEventsUnregister({ route }) {
  const navigation = useNavigation();
  const event = route.params.event;
  const [errText, setErrText] = useState(null);

  const fields = {
    email: new PropertyDefinition('Email').isRequired(),
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.text}>
          Abmeldung für das Event: {event.title}
        </Text>
        <Text>
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
    padding: 5,
    marginBottom: 4,
  },
  text: {
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: '2%',
  },
});
