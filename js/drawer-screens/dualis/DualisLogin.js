import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Paragraph, Text, TextInput } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';

export default function DualisLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);
  const [error, setError] = useState(null);

  function login() {
    setLoading(true);
    try {
      fetch('http://134.255.237.241/login/', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      })
        .then((resp) => resp.json())
        .then((respJson) => {
          if (respJson.jwt != '' && respJson.jwt != null) {
            AsyncStorage.setItem('dualisToken', respJson.jwt);
            setEmail('');
            setPassword('');
            setLoginFailed(false);
            navigation.navigate('DualisMain');
          } else {
            setLoginFailed(true);
          }
          setLoading(false);
        });
    } catch (ex) {
      setError(ex);
    }
  }

  let textInputTheme = loginFailed ? failureTheme : standardTheme;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        theme={textInputTheme}
        onChangeText={(value) => setEmail(value)}
        value={email}
        placeholder="DHBW E-Mail"
      />
      <TextInput
        style={styles.textInput}
        theme={textInputTheme}
        onChangeText={(value) => setPassword(value)}
        secureTextEntry={true}
        value={password}
        placeholder="Passwort"
      />
      <TouchableOpacity style={styles.dhbwButton} onPress={login}>
        <Text style={styles.buttonText}>Anmelden</Text>
        {loading && (
          <ActivityIndicator size="large" color={Colors.lightGray} />
        )}
      </TouchableOpacity>
      {error && <Text>{error}</Text>}
      <Paragraph style={styles.paragraph}>
        Bitte denke daran, dass keine Gewähr für die Richtigkeit der
        hier bereitgestellten Informationen übernommen werden kann. Im
        Zweifelsfall ist das Sekretariat oder die entsprechende
        Lehrkraft zu befragen.
      </Paragraph>
      <Paragraph style={styles.paragraph}>
        Aus Sicherheitsgründen wirst Du nach 10 Minuten automatisch
        abgemeldet.
      </Paragraph>
    </View>
  );
}

const standardTheme = {
  colors: {
    primary: Colors.dhbwRed,
    text: 'black',
    background: Colors.lightGray,
  },
};
const failureTheme = {
  colors: {
    primary: Colors.dhbwRed,
    text: 'white',
    background: Colors.dhbwRed,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 14,
    paddingLeft: '10%',
    paddingRight: '10%',
    textAlign: 'center',
    marginTop: 40,
  },
  dhbwButton: {
    width: '100%',
    backgroundColor: Colors.dhbwRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    margin: 20,
  },
  textInput: {
    marginTop: 40,
  },
});
