import React, { memo } from "react";
import {
  Linking,
  Platform,
  Text,
  type TextProps,
  type StyleProp,
  type TextStyle,
} from "react-native";

interface LinkifiedTextProps extends Omit<TextProps, "children"> {
  value?: string | null;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

// Shorten links to display e.g. https://bbb.dhbw.de/…
const URL_SCHEME_HOST = /^(https?:\/\/)([^/\s]+)/i;
const formatUrlLabel = (rawUrl: string) => {
  const m = URL_SCHEME_HOST.exec(rawUrl);
  return m ? `${m[1]}${m[2]}/…` : rawUrl;
};

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

// Remove trailing punctuation that often sticks to URLs in plain text
const trimTrailingPunctuation = (url: string) => {
  return url.replace(/[\.,;:!?\)\]\}]+$/g, "");
};

const openLink = (url: string) => {
  if (Platform.OS === "web") {
    window.open(url, "_blank");
  } else {
    Linking.openURL(url);
  }
};

const LinkifiedText: React.FC<LinkifiedTextProps> = memo(
  ({ value, style, numberOfLines }) => {
    if (!value) {
      return null;
    }
    const parts = value.split(URL_REGEX);

    return (
      <Text style={[style]} numberOfLines={numberOfLines}>
        {parts.map((part, index) => {
          if (part.length === 0) return null; // nicht trimmen -> Spaces/Zeilenumbrüche bleiben erhalten
          const isUrl = /^https?:\/\//i.test(part);
          if (!isUrl) {
            return <Text key={`t-${index}`}>{part}</Text>;
          }
          const cleanUrl = trimTrailingPunctuation(part);
          const label = formatUrlLabel(cleanUrl);
          return (
            <Text
              key={`u-${index}`}
              style={{ textDecorationLine: "underline" }}
              onPress={() => openLink(cleanUrl)}
              suppressHighlighting
              accessibilityRole="link"
              accessibilityHint="Öffnet den Link in einem Browser"
            >
              {label}
            </Text>
          );
        })}
      </Text>
    );
  },
);

LinkifiedText.displayName = "LinkifiedText";

export default LinkifiedText;
