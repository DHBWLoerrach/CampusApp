import React, { useContext } from 'react';
import { Linking, Text, View } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

import { textFeedback } from './Texts';
import ListCellTouchable from '../../util/ListCellTouchable';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

export default function Feedback() {
  const url =
    'mailto:apps@dhbw-loerrach.de?subject=Campus%20App%20Feedback';
  const colorContext = useContext(ColorSchemeContext);

  return (
    <View
      style={[
        Styles.Feedback.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <Text style={{ color: colorContext.colorScheme.text }}>
        {textFeedback}
      </Text>
      <ListCellTouchable
        underlayColor={colorContext.colorScheme.card}
        onPress={() => Linking.openURL(url)}
      >
        <View style={Styles.Feedback.row}>
          <Text
            style={[
              Styles.Feedback.title,
              { color: colorContext.colorScheme.text },
            ]}
            numberOfLines={2}
          >
            Feedback senden
          </Text>
          <FontAwesome6
            name="chevron-right"
            size={16}
            style={{ color: colorContext.colorScheme.icon }}
          />
        </View>
      </ListCellTouchable>
    </View>
  );
}
