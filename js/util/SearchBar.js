import React, { useContext, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Styles from '../Styles/StyleSheet';
import { ColorSchemeContext } from '../context/ColorSchemeContext';

export default function SearchBar({ onSearch, searchString }) {
  const searchInput = useRef(null);
  const [hasInput, setHasInput] = useState(false);
  const colorContext = useContext(ColorSchemeContext);
  return (
    <View
      style={[
        Styles.SearchBar.searchBar,
        { backgroundColor: colorContext.colorScheme.card },
      ]}
    >
      <FontAwesome6
        name="magnifying-glass"
        size={16}
        style={{ marginRight: 4 }}
        color={colorContext.colorScheme.icon}
        onPress={() => searchInput.current.focus()}
      />
      <TextInput
        style={[
          Styles.SearchBar.searchInput,
          { color: colorContext.colorScheme.text },
        ]}
        ref={searchInput}
        autoCorrect={false}
        placeholder="Suchen"
        placeholderTextColor={colorContext.colorScheme.text}
        onChangeText={(text) => {
          onSearch(text);
          setHasInput(text && text.length > 0);
        }}
        value={searchString}
      />
      {hasInput ? (
        <FontAwesome6
          name="xmark"
          size={16}
          color={colorContext.colorScheme.icon}
          onPress={() => {
            onSearch('');
            searchInput.current.clear();
            setHasInput(false);
          }}
        />
      ) : null}
    </View>
  );
}
