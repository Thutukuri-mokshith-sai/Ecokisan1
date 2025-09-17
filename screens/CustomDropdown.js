// components/CustomDropdown.js
import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { StyleSheet, View } from 'react-native';

const CustomDropdown = ({
  placeholder,
  items,
  value,
  setValue,
  setOpen,
  open,
  disabled,
}) => {
  return (
    <View style={styles.container}>
      <DropDownPicker
        placeholder={placeholder}
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        listMode="SCROLLVIEW"
        disabled={disabled}
        searchable={true}
        style={styles.dropdown}
        textStyle={styles.text}
        placeholderStyle={styles.placeholder}
        dropDownContainerStyle={styles.dropdownContainer}
        searchContainerStyle={styles.searchContainer}
        searchTextInputStyle={styles.searchInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    zIndex: 10, // Ensure dropdowns don't overlap
  },
  dropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#a9a9a9',
  },
  searchContainer: {
    borderBottomColor: '#ccc',
  },
  searchInput: {
    borderColor: '#ccc',
  },
});

export default CustomDropdown;