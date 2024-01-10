import React, { useContext } from 'react';
import { Alert, Platform, Linking, Text, View } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import ListCellTouchable from '../../util/ListCellTouchable';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

export default function LinksList({ navigation, route }) {
  const colorContext = useContext(ColorSchemeContext);

  const content = route.params?.links.map((link, index) => (
    <Row link={link} key={index} navigate={navigation.navigate} />
  ));
  return (
    <View
      style={[
        Styles.LinksList.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <ItemsWithSeparator>{content}</ItemsWithSeparator>
    </View>
  );
}

function ItemsWithSeparator(props) {
  const children = [];
  const colorContext = useContext(ColorSchemeContext);
  const length = React.Children.count(props.children);
  React.Children.forEach(props.children, (child, ii) => {
    children.push(child);
    if (ii !== length - 1) {
      children.push(
        <View
          key={'separator-' + ii}
          style={[
            Styles.LinksList.separator,
            { backgroundColor: colorContext.colorScheme.cellBorder },
          ]}
        />
      );
    }
  });
  return <View>{children}</View>;
}

function Row(props) {
  const { title, url, tel, onPress, screen } = props.link;
  const colorContext = useContext(ColorSchemeContext);

  let icon = null;
  if (tel) {
    icon = (
      <FontAwesome6
        name="phone"
        size={16}
        style={{
          color: colorContext.colorScheme.icon,
          backgroundColor: colorContext.colorScheme.background,
        }}
      />
    );
  }
  if (url) {
    icon = (
      <FontAwesome6
        name="arrow-up-right-from-square"
        size={16}
        style={{
          color: colorContext.colorScheme.icon,
          backgroundColor: colorContext.colorScheme.background,
        }}
      />
    );
  }
  if (onPress || screen) {
    icon = (
      <FontAwesome6
        name="chevron-right"
        size={16}
        style={{
          color: colorContext.colorScheme.icon,
          backgroundColor: colorContext.colorScheme.background,
        }}
      />
    );
  }

  const _handlePress = () => {
    _handleOnPress();
    _handleUrlPress();
    _handleScreenPress();
    _handleTelPress();
  };

  const _handleOnPress = () => {
    const { onPress } = props.link;
    if (onPress) onPress();
  };

  const _handleUrlPress = () => {
    const { url } = props.link;
    if (url) Linking.openURL(url);
  };

  const _handleScreenPress = () => {
    const { screen, text } = props.link;
    if (screen) props.navigate(screen, { text });
  };

  const _handleTelPress = () => {
    const { tel } = props.link;
    if (tel) {
      const telLink = 'tel:' + tel;
      if (Platform.OS === 'ios') {
        Alert.alert('Nummer wählen?', tel, [
          { text: 'Nein' },
          { text: 'Ja', onPress: () => _openTelLink(telLink) },
        ]);
      } else {
        _openTelLink(telLink);
      }
    }
  };

  const _openTelLink = (telLink) => {
    Linking.openURL(telLink);
  };

  return (
    <ListCellTouchable
      underlayColor={colorContext.colorScheme.cellBorder}
      onPress={_handlePress.bind(this)}
    >
      <View style={Styles.LinksList.row}>
        <Text
          style={[
            Styles.LinksList.title,
            { color: colorContext.colorScheme.text },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {icon}
      </View>
    </ListCellTouchable>
  );
}
