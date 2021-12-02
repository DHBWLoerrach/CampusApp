import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Colors from './Colors';

export default function SearchBar({ onSearch, searchString }) {
  const searchInput = useRef(null);
  const [hasInput, setHasInput] = useState(false);
  return (
    <View style={styles.searchBar}>
      <MaterialIcon
        name="search"
        size={24}
        color={Colors.dhbwGray}
        onPress={() => searchInput.current.focus()}
      />
      <TextInput
        style={styles.searchInput}
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

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    margin: 10,
    padding: 3,
    backgroundColor: Colors.veryLightGray,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: 'black',
  },
});
