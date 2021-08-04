import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { unregisterUserEvent } from '../helper';
import Form from '../../../util/Form';
import PropertyDefinition from '../../../util/PropertyDefinition';

export default function StuVEventsUnregister({ route }) {
  const navigation = useNavigation();
  const event = route.params.event;
  const [errText, setErrText] = React.useState(null);

  const fields = {
    email: new PropertyDefinition('Email').isRequired(),
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 5, marginBottom: 4 }}>
        <Text style={{ fontWeight: 'bold' }}>
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
      <Text style={{ color: 'red', marginBottom: '2%' }}>
        {errText}
      </Text>
    </View>
  );
}
