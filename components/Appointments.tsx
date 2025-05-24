import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import UserData from './UserData';

export default function Appointments() {
  return (
    <ScrollView style={styles.container}>
      <UserData show="appointments" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
});
