import { useContext } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

export default function LinkTiles({ route }) {
  const colorContext = useContext(ColorSchemeContext);
  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 10,
        backgroundColor: colorContext.colorScheme.background,
      }}
    >
      <Text
        style={{
          color: colorContext.colorScheme.text,
          fontSize: 16,
          fontWeight: '400',
        }}
      >
        {route.params?.text}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 20,
          marginTop: 40,
        }}
      >
        {route.params?.links.map((link, index) => {
          return (
            <Pressable
              key={index}
              onPress={() => Linking.openURL(link.url)}
              style={Styles.General.cardShadow}
            >
              <Image
                style={{ borderRadius: 10 }}
                source={link.img}
                accessibilityLabel={link.title}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
