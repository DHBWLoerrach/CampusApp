import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Paragraph, Text, TextInput } from 'react-native-paper';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from '../../util/Colors';

class DualisLogin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      loading: false,
      loginFailed: false,
      error: null,
    };

    this.login = this.login.bind(this);
  }

  login() {
    this.setState({ loading: true });
    try {
      fetch('http://134.255.237.241/login/', {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        mode: 'cors',
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
        }),
      })
        .then((resp) => resp.json())
        .then((respJson) => {
          if (respJson.jwt != '' && respJson.jwt != null) {
            AsyncStorage.setItem('dualisToken', respJson.jwt);
            this.setState({
              email: '',
              password: '',
              loginFailed: false,
            });
            this.props.navigation.navigate('DualisMain');
          } else {
            this.setState({ loginFailed: true });
          }

          this.setState({ loading: false });
        });
    } catch (ex) {
      this.setState({ error: ex });
    }
  }

  render() {
    let textInputTheme = this.state.loginFailed
      ? failureTheme
      : standardTheme;

    return (
      <View style={styles.container}>
        <TextInput
          style={{ marginTop: 40 }}
          theme={textInputTheme}
          onChangeText={(value) => {
            this.setState({ email: value });
          }}
          value={this.state.email}
          placeholder="DHBW E-Mail"
        />
        <TextInput
          ref={(ref) =>
            ref &&
            ref.setNativeProps({
              style: { fontFamily: 'system font' },
            })
          }
          style={{ marginTop: 40 }}
          theme={textInputTheme}
          onChangeText={(value) => {
            this.setState({ password: value });
          }}
          secureTextEntry={true}
          value={this.state.password}
          placeholder="Passwort"
        />
        <TouchableOpacity
          style={styles.dhbwButton}
          onPress={this.login}
        >
          <Text style={{ color: 'white', margin: 20 }}>Anmelden</Text>
          {this.state.loading && (
            <ActivityIndicator
              size="large"
              color={Colors.lightGray}
            />
          )}
        </TouchableOpacity>
        {this.state.error && <Text>{this.state.error}</Text>}
        <Paragraph style={styles.paragraph}>
          Bitte denke daran, dass keine Gewähr für die Richtigkeit der
          hier bereitgestellten Informationen übernommen werden kann.
          Im Zweifelsfall ist das Sekretariat oder die entsprechende
          Lehrkraft zu befragen.
        </Paragraph>
        <Paragraph style={styles.paragraph}>
          Aus Sicherheitsgründen wirst Du nach 10 Minuten automatisch
          abgemeldet.
        </Paragraph>
      </View>
    );
  }
}

export default DualisLogin;

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
});
