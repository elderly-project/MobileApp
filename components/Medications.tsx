import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import UserData from './UserData';

export default function Medications() {
  return (
    <ScrollView style={styles.container}>
      <UserData show="medications" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
});
