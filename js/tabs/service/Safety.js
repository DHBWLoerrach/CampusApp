import { useContext } from 'react';
import {
  Button,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';

const links = [
  {
    title: 'Herzlich Willkommen',
    url: 'https://video.dhbw.de/videos/video-1_9se923y8gn/',
    img: require('./img/security/1.jpg'),
  },
  {
    title: 'Sicherheit an der DHBW Lörrach',
    url: 'https://video.dhbw.de/videos/video-2_3jlqt4t17l/',
    img: require('./img/security/2.jpg'),
  },
  {
    title: 'Notfalleinrichtungen',
    url: 'https://video.dhbw.de/videos/video-3_m885vwgf9y/',
    img: require('./img/security/3.jpg'),
  },
  {
    title: 'Arbeits- und Wegeunfälle',
    url: 'https://video.dhbw.de/videos/video-4_9kjeusngm4/',
    img: require('./img/security/4.jpg'),
  },
  {
    title: 'Brandschutz',
    url: 'https://video.dhbw.de/videos/video-5_befqkvvxdz/',
    img: require('./img/security/5.jpg'),
  },
];

const text =
  'Ihre Sicherheit liegt uns am Herzen. Deshalb haben wir diese Videos zusammengestellt, in denen wir Sie über verschiedene Sicherheitshemen an der DHBW Lörrach informieren. Sie erfahren, wie Sie sich vor Unfällen schützen können und welche Sicherheitseinrichtungen es an den Standorten gibt. Viel Spaß!';

export default function Safety({ navigation }) {
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
        {text}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 20,
          marginTop: 40,
          marginBottom: 20,
        }}
      >
        {links.map((link, index) => {
          return (
            <Pressable
              key={index}
              onPress={() => Linking.openURL(link.url)}
              style={[
                {
                  borderRadius: 10,
                  backgroundColor: colorContext.colorScheme.card,
                },
                Styles.General.cardShadow,
              ]}
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
      <Button
        title="Brandschutzordnung (PDF)"
        color={colorContext.colorScheme.dhbwRed}
        onPress={() => navigation.navigate('FireSafety')}
      />
    </ScrollView>
  );
}
