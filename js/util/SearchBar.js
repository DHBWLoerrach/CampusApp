import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../Styles/Colors';
import Styles from '../Styles/StyleSheet';

export default function SearchBar({ onSearch, searchString }) {
  const searchInput = useRef(null);
  const [hasInput, setHasInput] = useState(false);
  return (
    <View style={Styles.SearchBar.searchBar}>
      <MaterialIcon
        name="search"
        size={24}
        color={Colors.dhbwGray}
        onPress={() => searchInput.current.focus()}
      />
      <TextInput
        style={Styles.SearchBar.searchInput}
        ref={searchInput}
        autoCorrect={false}
        placeholder="Suchen"
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
          color={Colors.dhbwGray}
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
