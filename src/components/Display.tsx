import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  expression: string;
  result: string;
  isAuthMode?: boolean;
}

export default function Display({ expression, result, isAuthMode }: Props) {
  return (
    <View style={[styles.container, isAuthMode && styles.authContainer]}>
      <Text style={[styles.expression, isAuthMode && styles.authText]}>
        {expression || (isAuthMode ? 'Enter PIN' : '0')}
      </Text>
      <Text style={[styles.result, isAuthMode && styles.authText]}>
        {result || (isAuthMode ? 'Vault Locked' : '0')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'flex-end', backgroundColor: '#000', minHeight: 120, justifyContent: 'flex-end' },
  authContainer: { backgroundColor: '#1a1a1a', borderBottomColor: '#0f0', borderBottomWidth: 2 },
  expression: { fontSize: 32, color: '#fff', opacity: 0.8 },
  result: { fontSize: 48, color: '#fff', fontWeight: 'bold' },
  authText: { color: '#4dff4d' },
});