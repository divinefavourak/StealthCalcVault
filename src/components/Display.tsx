import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  expression: string;
  result: string;
}

export default function Display({ expression, result }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.expression}>{expression || '0'}</Text>
      <Text style={styles.result}>{result || '0'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'flex-end', backgroundColor: '#000' },
  expression: { fontSize: 32, color: '#fff', opacity: 0.8 },
  result: { fontSize: 48, color: '#fff', fontWeight: 'bold' },
});