import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import WelcomeScreen from './WelcomeScreen';
import Navigator from './Navigator';

export const RoleContext = React.createContext(null);

export default function CampusApp() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setRole(role);
      setLoading(false);
    };
    fetchRole();
  }, []);

  const changeRole = role => {
    AsyncStorage.setItem('role', role);
    setRole(role);
  };

  let content = <Navigator />;
  if (loading) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator animating={true} />
      </View>
    );
  } else if (!role) {
    content = <WelcomeScreen onSubmit={changeRole} />;
  }

  return (
    <RoleContext.Provider value={{ role, changeRole }}>
      <View style={styles.container}>
        <StatusBar
          translucent={true}
          backgroundColor="rgba(0, 0, 0, 0.2)"
          barStyle="light-content"
        />
        {content}
      </View>
    </RoleContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  center: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
