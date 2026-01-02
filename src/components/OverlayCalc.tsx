import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OverlayCalc() {
  return (
    <View style={styles.overlay}>
      <Text style={styles.text}>StealthCalc</Text>
      <Text style={styles.display}>0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 32, color: '#fff', marginBottom: 50 },
  display: { fontSize: 72, color: '#0f0' },
});