import React, {useContext, useRef, useState} from 'react';
import { TextInput, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Styles from '../Styles/StyleSheet';
import {ColorSchemeContext} from "../context/ColorSchemeContext";

export default function SearchBar({ onSearch, searchString }) {
  const searchInput = useRef(null);
  const [hasInput, setHasInput] = useState(false);
  const colorContext = useContext(ColorSchemeContext);
  return (
    <View style={[Styles.SearchBar.searchBar, {backgroundColor: colorContext.colorScheme.card}]}>
      <MaterialIcon
        name="search"
        size={24}
        color={colorContext.colorScheme.icon}
        onPress={() => searchInput.current.focus()}
      />
      <TextInput
        style={[Styles.SearchBar.searchInput, {color: colorContext.colorScheme.text}]}
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
        <MaterialIcon
          name="clear"
          size={24}
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
